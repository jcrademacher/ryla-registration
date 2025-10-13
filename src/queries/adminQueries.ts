import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCamp, listCamps } from "../api/apiCamp";
import { listCamperProfilesByCamp, listRotarianReviewsByCamp, observeCamperProfilesByCamp } from "../api/apiCamperProfile";
import { useParams } from "react-router";
import { useEffect } from "react";

export function useListCampsQuery() {
    return useQuery({
        queryKey: ['camps'],
        queryFn: listCamps
    });
}

export function useCamperProfilesByCampQuery() {
    const { campId } = useParams();

    return useQuery({
        queryKey: ['camperProfilesByCamp', campId],
        queryFn: () => {
            if (!campId) {
                throw new Error("Camp ID is required");
            }
            return listCamperProfilesByCamp(campId);
        },
        staleTime: 60 * 1000, // 1 minute
        enabled: !!campId
    });
}

export function useCampQuery() {
    const { campId } = useParams();

    return useQuery({
        queryKey: ['camp', campId],
        queryFn: () => {
            if (!campId) {
                throw new Error("Camp ID is required");
            }
            return getCamp(campId);
        },
        staleTime: 60 * 1000, // 1 minute
        enabled: !!campId
    });
}

export function useRotarianReviewsByCampQuery(campId?: string) {

    return useQuery({
        queryKey: ['rotarianReviewsByCamp', campId],
        queryFn: () => {
            if (!campId) {
                throw new Error("Camp ID is required");
            }
            return listRotarianReviewsByCamp(campId);
        },
        staleTime: 60 * 1000, // 1 minute
        enabled: !!campId
    });
}

export function useObserveCamperProfilesByCampQuery(campId?: string) {
    const queryClient = useQueryClient();
    
    return useEffect(() => {
        if(campId) {
            const sub = observeCamperProfilesByCamp(campId, () => {
                queryClient.invalidateQueries({ queryKey: ['camperProfilesByCamp', campId] });
            });
            return () => sub.unsubscribe();
        }
    }, [campId, queryClient]);
}