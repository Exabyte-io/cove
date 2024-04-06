export var ActionEnum;
(function (ActionEnum) {
    ActionEnum["GET_DATA"] = "get-data";
    ActionEnum["SET_DATA"] = "set-data";
    ActionEnum["INFO"] = "info";
})(ActionEnum || (ActionEnum = {}));
class IframeToFromHostMessageHandler {
    constructor() {
        this.handlers = {
            [ActionEnum.GET_DATA]: [],
            [ActionEnum.SET_DATA]: [],
            [ActionEnum.INFO]: [],
        };
        // Default values for the origin URLs  to pass the CORS policy, if not provided from the parent component
        this.iframeOriginURL = "*";
        this.hostOriginURL = "*";
        // The DOM id of the iframe that is loaded in the host page to send messages from/to
        this.iframeId = "";
        this.receiveMessage = (event) => {
            if (this.iframeOriginURL !== "*" &&
                event.origin !== this.iframeOriginURL &&
                event.origin !== this.hostOriginURL) {
                return;
            }
            if (event.data.type === "from-iframe-to-host") {
                const { action, payload } = event.data;
                if (this.handlers[action]) {
                    this.handlers[action].forEach((handler) => {
                        Promise.resolve(handler(payload))
                            .then((data) => {
                            // If the handler returns data, send it to the iframe
                            if (data !== undefined) {
                                this.sendData(data);
                            }
                        })
                            .catch((error) => {
                            console.error(`Error in handler for ${action}:`, error);
                        });
                    });
                }
            }
        };
    }
    init(iframeOriginURL, iframeId) {
        window.addEventListener("message", this.receiveMessage);
        this.iframeOriginURL = iframeOriginURL;
        this.hostOriginURL = window.location.origin;
        this.iframeId = iframeId;
    }
    destroy() {
        window.removeEventListener("message", this.receiveMessage);
    }
    addHandlers(action, handlers) {
        if (!this.handlers[action]) {
            this.handlers[action] = [];
        }
        this.handlers[action].push(...handlers);
    }
    sendData(data) {
        const message = {
            type: "from-host-to-iframe",
            action: "set-data",
            payload: data,
        };
        const iframe = document.getElementById(this.iframeId);
        if (iframe) {
            // @ts-ignore
            iframe.contentWindow.postMessage(message, this.iframeOriginURL);
        }
    }
}
export default IframeToFromHostMessageHandler;
