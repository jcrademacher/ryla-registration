import { env } from '$amplify/env/generate-camper-pdf';
import { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getCamperProfile, listCamperDocuments, listRecommendations } from "./graphql/queries";
import { getUrl } from 'aws-amplify/storage';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// @ts-ignore: Module resolution/type declarations are available at runtime
import { PDFDocument } from 'pdf-lib';

Amplify.configure(
    {
        API: {
            GraphQL: {
                endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
                region: env.AWS_REGION,
                defaultAuthMode: "iam",
            },
        },
    },
    {
        Auth: {
            credentialsProvider: {
                getCredentialsAndIdentityId: async () => ({
                    credentials: {
                        accessKeyId: env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                        sessionToken: env.AWS_SESSION_TOKEN,
                    },
                }),
                clearCredentialsAndIdentityId: () => {
                    /* noop */
                },
            },
        },
    }
);

const client = generateClient<Schema>({
    authMode: "iam",
});

type Handler = Schema["generateCamperPdf"]["functionHandler"]

export const handler: Handler = async (event) => {
    const { camperSub } = event.arguments;

    const camperRes = await client.graphql({
        query: getCamperProfile,
        variables: {
            userSub: camperSub,
        },
    });

    if(camperRes.errors) {
        console.error(camperRes.errors);
        throw new Error('Error getting camper profile');
    }

    const camper = camperRes.data?.getCamperProfile;
    if(!camper) {
        throw new Error('Camper not found');
    }

    const firstName = camper.firstName ?? '';
    const lastName = camper.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const campLabel = camper.campId; // expected format: "RYLA XXXX"
    const generatedAt = new Date().toISOString();
    const rotaryClubName = camper.rotaryClub?.name ?? '';
    const requiresApplication = !!camper.rotaryClub?.requiresApplication;
    const requiresLOR = !!camper.rotaryClub?.requiresLetterOfRecommendation;

    // Constants for page size
    const a4Width = 595.28; // pt
    const a4Height = 841.89; // pt

    // Prepare compact profile text (excluding identity info)
    const profileLines: string[] = [];
    const push = (label: string, value?: string | null) => {
        if(value) profileLines.push(`${label}: ${value}`);
    };
    push('Name', fullName || 'N/A');
    push('Email', camper.email);
    push('Phone', camper.phone);
    push('Address', camper.address);
    push('City', camper.city);
    push('State', camper.state);
    push('Zip', camper.zipcode);
    push('High School', camper.highSchool);
    push('Guidance Counselor', camper.guidanceCounselorName);
    push('Guidance Counselor Email', camper.guidanceCounselorEmail);
    push('Guidance Counselor Phone', camper.guidanceCounselorPhone);
    push('Dietary Restrictions', camper.dietaryRestrictions);
    push('Dietary Notes', camper.dietaryRestrictionsNotes);
    push('Parent 1', [camper.parent1FirstName, camper.parent1LastName].filter(Boolean).join(' '));
    push('Parent 1 Email', camper.parent1Email);
    push('Parent 1 Phone', camper.parent1Phone);
    push('Parent 2', [camper.parent2FirstName, camper.parent2LastName].filter(Boolean).join(' '));
    push('Parent 2 Email', camper.parent2Email);
    push('Parent 2 Phone', camper.parent2Phone);
    push('Emergency Contact', camper.emergencyContactName);
    push('Emergency Phone', camper.emergencyContactPhone);
    push('Emergency Relationship', camper.emergencyContactRelationship);
    push('Rotary Club', rotaryClubName);

    const title = `${fullName || 'Camper'} ${campLabel} package`;
    const subtitle = `Generated: ${generatedAt}`;

    // Create merged PDF and draw first page content
    const mergedPdf = await PDFDocument.create();
    const page = mergedPdf.addPage([a4Width, a4Height]);
    const marginX = 40;
    let cursorY = a4Height - 40;

    page.drawText(title, {
        x: marginX,
        y: cursorY,
        size: 18,
        color: undefined,
    });
    cursorY -= 28;
    page.drawText(subtitle, {
        x: marginX,
        y: cursorY,
        size: 12,
        color: undefined,
    });
    cursorY -= 22;

    const profileText = profileLines.join('\n');
    const lineHeight = 14;
    for (const line of profileText.split('\n')) {
        if (cursorY < 60) break; // keep it compact
        page.drawText(line, {
            x: marginX,
            y: cursorY,
            size: 10,
        });
        cursorY -= lineHeight;
    }

    const fetchPdf = async (path: string | null | undefined) => {
        if(!path) return null;
        const url = await getUrl({ path });
        const res = await fetch(url.url.toString());
        if(!res.ok) return null;
        const ab = await res.arrayBuffer();
        return new Uint8Array(ab);
    };

    // Application (if required)
    if(requiresApplication && camper.applicationFilepath) {
        const appPdf = await fetchPdf(camper.applicationFilepath);
        if(appPdf) {
            try {
                const src = await PDFDocument.load(appPdf);
                const pages = await mergedPdf.copyPages(src, src.getPageIndices());
                pages.forEach((p: any) => mergedPdf.addPage(p));
            } catch {}
        }
    }

    // Letter of recommendation (if required)
    if(requiresLOR) {
        const recRes = await client.graphql({
            query: listRecommendations,
            variables: {
                filter: { camperUserSub: { eq: camper.userSub } },
                limit: 10
            },
        });
        const recItems = recRes.data?.listRecommendations?.items ?? [];
        const firstRecPath = recItems.find((r: any) => !!r.filepath)?.filepath as string | undefined;
        const recPdf = await fetchPdf(firstRecPath);
        if(recPdf) {
            try {
                const src = await PDFDocument.load(recPdf);
                const pages = await mergedPdf.copyPages(src, src.getPageIndices());
                pages.forEach((p: any) => mergedPdf.addPage(p));
            } catch {}
        }
    }

    // Camper documents
    const docsRes = await client.graphql({
        query: listCamperDocuments,
        variables: {
            camperUserSub: camper.userSub,
            limit: 100
        },
    });
    const docItems: any[] = docsRes.data?.listCamperDocuments?.items ?? [];
    for(const doc of docItems) {
        // Best-effort: only include obvious PDFs
        const path = doc.filepath as string | undefined;
        if(!path) continue;
        if(!path.toLowerCase().endsWith('.pdf')) continue;
        const pdf = await fetchPdf(path);
        if(pdf) {
            try {
                const src = await PDFDocument.load(pdf);
                const pages = await mergedPdf.copyPages(src, src.getPageIndices());
                pages.forEach((p: any) => mergedPdf.addPage(p));
            } catch {}
        }
    }

    const mergedBytes = await mergedPdf.save();

    // Upload to S3 bucket path: camper-packages/[userSub].pdf using S3Client
    const uploadPath = `camper-packages/${camper.userSub}.pdf`;
    const bucketName = (env as any).RYLAREGISTRATIONSTORAGE_BUCKET_NAME || (env as any).STORAGE_BUCKET_NAME || (env as any).AWS_S3_BUCKET_NAME;
    if(!bucketName) {
        throw new Error('Storage bucket name env var not found');
    }

    const s3 = new S3Client();
    const putCmd = new PutObjectCommand({
        Bucket: bucketName,
        Key: uploadPath,
        Body: mergedBytes,
        ContentType: 'application/pdf'
    });
    await s3.send(putCmd);

    const linkToStorageFile = await getUrl({ path: uploadPath });
    return linkToStorageFile.url.toString();
}
