window.claude = {
  use(capability) {
    if (capability === 'mcp') {
      return fetch('/sheets-data.json')
        .then((r) => r.json())
        .then((rows) => ({
          watchTool(_server, _tool, _input, callback) {
            setTimeout(() => {
              callback({ type: 'data', result: { payload: { values: rows }, cache: { storedAt: Date.now() } } });
            }, 0);
            return () => {};
          },
          invalidate(_server, _tool, _input) {
            return Promise.resolve();
          },
        }))
        .catch(() => null);
    }

    if (capability === 'downloads') {
      return Promise.resolve({
        download(filename, content, mimeType = 'application/octet-stream') {
          const blob =
            content instanceof Blob
              ? content
              : new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = Object.assign(document.createElement('a'), {
            href: url,
            download: filename,
          });
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        },
      });
    }

    return Promise.resolve(null);
  },
};
