try {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js");

    async function loadPyodideAndPackages() {
        self.pyodide = await loadPyodide();
    }

    let pyodideReadyPromise = loadPyodideAndPackages();

    self.onmessage = async (event) => {
        await pyodideReadyPromise;
        const id = event.data.id || 0;
        const python = event.data.python || 'None';
        const context = event.data.context || {};
        for (const key of Object.keys(context)) {
            self[key] = context[key];
        }
        try {
            await self.pyodide.loadPackagesFromImports(python);
            let results = await self.pyodide.runPythonAsync(python, context);
            self.postMessage({
                status: 'success',
                id: id,
                results: results
            });
        } catch (error) {
            self.postMessage({
                status: 'error',
                id: id,
                message: error.message
            });
        }
    };

    (async () => {
        await pyodideReadyPromise;
        self.postMessage({ status: 'ready' });
    })();
}
catch (error) {
    self.postMessage({
        status: 'error',
        id: -1,
        message: 'python load error: ' + error.message
    });
}
