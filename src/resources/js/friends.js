const documentReadyWithoutJQuery = setInterval( () => {
    if (document.readyState !== 'complete') return;
    clearInterval(documentReadyWithoutJQuery)

    // Document has just become ready
    // Code here will run one upon document becoming ready

}, 50)