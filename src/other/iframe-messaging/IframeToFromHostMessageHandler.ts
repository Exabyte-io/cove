import { IframeMessageSchema } from "@mat3ra/esse/dist/js/types";

type HandlerFunction = (...args: IframeMessageSchema["payload"][]) => void | any;

type HandlersMap = {
    [action in IframeMessageSchema["action"]]: HandlerFunction[];
};
export enum ActionEnum {
    GET_DATA = "get-data",
    SET_DATA = "set-data",
    INFO = "info",
}

class IframeToFromHostMessageHandler {
    private handlers: HandlersMap = {
        [ActionEnum.GET_DATA]: [],
        [ActionEnum.SET_DATA]: [],
        [ActionEnum.INFO]: [],
    };

    // Default values for the origin URLs  to pass the CORS policy, if not provided from the parent component
    private iframeOriginURL = "*";

    private hostOriginURL = "*";

    // The DOM id of the iframe that is loaded in the host page to send messages from/to
    private iframeId = "";

    public init(iframeOriginURL: string, iframeId: string): void {
        window.addEventListener("message", this.receiveMessage);
        this.iframeOriginURL = iframeOriginURL;
        this.hostOriginURL = window.location.origin;
        this.iframeId = iframeId;
    }

    public destroy(): void {
        window.removeEventListener("message", this.receiveMessage);
    }

    public addHandlers(action: IframeMessageSchema["action"], handlers: HandlerFunction[]): void {
        if (!this.handlers[action]) {
            this.handlers[action] = [];
        }
        this.handlers[action].push(...handlers);
    }

    private receiveMessage = (event: MessageEvent<IframeMessageSchema>) => {
        if (
            this.iframeOriginURL !== "*" &&
            event.origin !== this.iframeOriginURL &&
            event.origin !== this.hostOriginURL
        ) {
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

    public sendData(data: object): void {
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
