import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);


import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.scss";
import { BrowserRouter } from 'react-router';
import App from "./App.tsx";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { emitToast, ToastType } from "./utils/notifications.tsx";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            networkMode: 'always', // or 'offlineFirst' or 'always'
            gcTime: 1000 * 60 * 60, // 24 hours
        },
        mutations: {
            networkMode: 'always',
            onSuccess: (data) => {
                console.log("Mutation success, data:", data);
            },
            onError: (error) => {
                console.error("Mutation error:", error);
                emitToast(error.message, ToastType.Error);
            }
        }
    },
    queryCache: new QueryCache({
        onError: (error) =>
            emitToast(error.message, ToastType.Error),

    })
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            <ReactQueryDevtools position='right' initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
