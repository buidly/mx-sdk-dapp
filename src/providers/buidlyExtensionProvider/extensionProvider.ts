import { Address, IPlainTransactionObject, Message, Transaction } from "@multiversx/sdk-core";
import { ErrAccountNotConnected, ErrCannotSignSingleTransaction, ErrWalletFeatureNotImplemented } from "./errors";

declare global {
    interface Window {
        buidlyWallet: { extensionId: string };
    }
}

export interface IProviderAccount {
    address: string;
    signature?: string;
}

enum BuidlyWalletFeature {
    CONNECT = 'buidly:connect',
    DISCONNECT = 'buidly:disconnect',
    SIGN_PERSONAL_MESSAGE = 'buidly:signPersonalMessage',
    SIGN_TRANSACTIONS = 'buidly:signTransactions',
    CANCEL_ACTION = 'buidly:cancelAction',
}

export class BuidlyExtensionProvider {
    private account: IProviderAccount = { address: "" };
    private initialized: boolean = false;
    private static _instance: BuidlyExtensionProvider = new BuidlyExtensionProvider();

    private constructor() {
        if (BuidlyExtensionProvider._instance) {
            throw new Error("Error: Instantiation failed: Use ExtensionProvider.getInstance() instead of new.");
        }
        BuidlyExtensionProvider._instance = this;
    }

    public static getInstance(): BuidlyExtensionProvider {
        return BuidlyExtensionProvider._instance;
    }

    public setAddress(address: string): BuidlyExtensionProvider {
        this.account.address = address;
        return BuidlyExtensionProvider._instance;
    }

    async init(): Promise<boolean> {
        if (window && window.buidlyWallet) {
            this.initialized = true;
        }
        return this.initialized;
    }

    async login(
        options: {
            callbackUrl?: string;
            token?: string;
        } = {}
    ): Promise<IProviderAccount> {
        if (!this.initialized) {
            throw new Error("Extension provider is not initialised, call init() first");
        }
        const { token } = options;
        const data = token ? token : "";

        const connectFeature = this.getWalletFeature(BuidlyWalletFeature.CONNECT) as any;
        const { address, signature } = await connectFeature.connect(data);

        this.account = { address, signature };
        return this.account;
    }

    async logout(): Promise<boolean> {
        if (!this.initialized) {
            throw new Error("Extension provider is not initialised, call init() first");
        }
        try {
            const disconnectFeature = this.getWalletFeature(BuidlyWalletFeature.DISCONNECT) as any;
            await disconnectFeature.disconnect();
            this.disconnect();
        } catch (error) {
            console.warn("Extension origin url is already cleared!", error);
        }

        return true;
    }

    private disconnect() {
        this.account = { address: "" };
    }

    async getAddress(): Promise<string> {
        if (!this.initialized) {
            throw new Error("Extension provider is not initialised, call init() first");
        }
        return this.account ? this.account.address : "";
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    isConnected(): boolean {
        return Boolean(this.account.address);
    }

    getAccount(): IProviderAccount | null {
        return this.account;
    }

    setAccount(account: IProviderAccount): void {
        this.account = account;
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        this.ensureConnected();

        const signedTransactions = await this.signTransactions([transaction]);

        if (signedTransactions.length != 1) {
            throw new ErrCannotSignSingleTransaction();
        }

        return signedTransactions[0];
    }

    private ensureConnected() {
        if (!this.account.address) {
            throw new ErrAccountNotConnected();
        }
    }

    async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        this.ensureConnected();

        const signTransactionsFeature = this.getWalletFeature(BuidlyWalletFeature.SIGN_TRANSACTIONS) as any;
        const extensionResponse = await signTransactionsFeature.signTransactions({
            from: this.account.address,
            transactions: transactions.map((transaction) => transaction.toPlainObject()),
        });

        try {
            const transactionsResponse = extensionResponse.map((transaction: IPlainTransactionObject) => Transaction.newFromPlainObject(transaction));
            return transactionsResponse;
        } catch (error: any) {
            throw new Error(`Transaction canceled: ${error.message}.`);
        }
    }

    async signMessage(messageToSign: Message): Promise<Message> {
        this.ensureConnected();

        const data = {
            account: this.account.address,
            message: Buffer.from(messageToSign.data).toString(),
        };
        const signMessageFeature = this.getWalletFeature(BuidlyWalletFeature.SIGN_PERSONAL_MESSAGE) as any;
        const extensionResponse = await signMessageFeature.signPersonalMessage(data);
        const signatureHex = extensionResponse.signature;
        const signature = Buffer.from(signatureHex, "hex");

        return new Message({
            data: Buffer.from(messageToSign.data),
            address: messageToSign.address ?? Address.newFromBech32(this.account.address),
            signer: "extension",
            version: messageToSign.version,
            signature,
        });
    }

    cancelAction() {
        const cancelActionFeature = this.getWalletFeature(BuidlyWalletFeature.CANCEL_ACTION) as any;
        cancelActionFeature.cancelAction().catch(() => { });
    }

    private getWalletFeature(featureName: string): unknown {
        const wallet = window.buidlyWallet as any;
        if (!(featureName in wallet.features)) {
            throw new ErrWalletFeatureNotImplemented(featureName);
        }
        return wallet.features[featureName];
    }
}
