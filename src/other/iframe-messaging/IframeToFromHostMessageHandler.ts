import { IframeMessageSchema } from "@mat3ra/esse/dist/js/types";

type HandlerFunction = (...args: IframeMessageSchema["payload"][]) => void | any;

type HandlersMap = {
    [action in IframeMessageSchema["action"]]: HandlerFunction[];
};

class IframeToFromHostMessageHandler {
    private handlers: HandlersMap = { "get-data": [], "set-data": [], info: [] };

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

    private receiveMessage = async (event: MessageEvent<IframeMessageSchema>) => {
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
                // eslint-disable-next-line no-restricted-syntax
                for (const handler of this.handlers["set-data"]) {
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        await handler(payload);
                    } catch (error) {
                        console.error(`Error executing handler for set-data:`, error);
                    }
                }
                // eslint-disable-next-line no-restricted-syntax
                for (const handler of this.handlers["get-data"]) {
                    // eslint-disable-next-line no-await-in-loop
                    const data = await handler(payload);
                    if (data) {
                        this.sendData(data);
                    }
                }
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
