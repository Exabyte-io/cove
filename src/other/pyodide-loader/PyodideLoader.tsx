import React, { useEffect, useState } from "react";

interface PyodideLoaderProps extends React.ComponentProps<any> {
    url?: string;
    getPyodide: (pyodide: any) => void;
    children: React.ReactNode;
    triggerLoad?: boolean;
}

declare global {
    interface Window {
        loadPyodide: () => Promise<any>;
    }
}

const defaultSourceUrl = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js";

function PyodideLoader({
    url = defaultSourceUrl,
    getPyodide,
    children,
    triggerLoad = true,
}: PyodideLoaderProps) {
    const [pyodide, setPyodide] = useState<any>(null);
    const [pyodideInitialized, setPyodideInitialized] = useState(false);

    const createScriptTag = (src: string) => {
        return new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script ${src}`));
            document.body.appendChild(script);
        });
    };

    const initializePyodide = async () => {
        try {
            await createScriptTag(url);
            const loadedPyodide = await window.loadPyodide();

            await loadedPyodide.loadPackage("micropip");
            setPyodide(loadedPyodide);
            setPyodideInitialized(true);
        } catch (error) {
            console.error("Could not initialize Pyodide", error);
        }
    };

    useEffect(() => {
        if (triggerLoad && !pyodideInitialized) {
            initializePyodide();
        }
    }, [triggerLoad, pyodideInitialized]);

    useEffect(() => {
        if (pyodideInitialized) {
            getPyodide(pyodide);
        }
    }, [pyodideInitialized, pyodide]);

    return <div>{children}</div>;
}

export default PyodideLoader;