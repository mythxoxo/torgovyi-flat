import "./JettonWallet";
import "./messages";

const ProvideAddressGasConsumption: Int = ton("0.01");
const Workchain: Int = 0;

struct JettonMasterState {
    totalSupply: Int as coins;
    mintable: Bool;
    adminAddress: Address;
    jettonContent: Cell;
    jettonWalletCode: Cell;
    launchPool: Address;
    transfersEnabled: Bool;
}

contract JettonMinter(
    totalSupply: Int as coins,
    owner: Address,
    jettonContent: Cell,
    launchPool: Address,
    transfersEnabled: Bool,
) {
    receive(msg: JettonBurnNotification) {
        let senderStd = parseStdAddress(sender().asSlice());
        let wallet = getJettonBasechainWalletByOwner(msg.sender, self.launchPool, self.transfersEnabled);
        throwUnless(74, senderStd.workchain == Workchain && senderStd.address == wallet.hash!!);

        self.totalSupply -= msg.amount;

        if (msg.responseDestination.isNotNone()) {
            message(MessageParameters {
                to: msg.responseDestination,
                body: JettonExcesses { queryId: msg.queryId }.toCell(),
                value: 0,
                bounce: false,
                mode: SendRemainingValue | SendIgnoreErrors,
            });
        }
    }

    receive(msg: ProvideWalletAddress) {
        let ctx = context();
        let fwdFee = ctx.readForwardFee();
        throwUnless(75, ctx.value > fwdFee + ProvideAddressGasConsumption);

        let ownerWorkchain: Int = parseStdAddress(msg.ownerAddress.asSlice()).workchain;
        let targetJettonWallet: BasechainAddress = (ownerWorkchain == Workchain)
            ? contractBasechainAddress(initOf JettonWallet(msg.ownerAddress, myAddress(), 0, self.launchPool, self.transfersEnabled))
            : emptyBasechainAddress();

        message(MessageParameters {
            body: makeTakeWalletAddressMsg(targetJettonWallet, msg),
            to: sender(),
            value: 0,
            mode: SendRemainingValue,
        });
    }

    receive(msg: JettonUpdateContent) {
        throwUnless(73, sender() == self.owner);
        self.jettonContent = msg.content;
    }

    receive(msg: Mint) {
        throwUnless(73, sender() == self.owner);
        self.totalSupply += msg.mintMessage.amount;

        deploy(DeployParameters {
            value: 0,
            bounce: true,
            mode: SendRemainingValue,
            body: msg.mintMessage.toCell(),
            init: getJettonWalletInit(msg.receiver, self.launchPool, self.transfersEnabled),
        });
    }

    receive(msg: ChangeOwner) {
        throwUnless(73, sender() == self.owner);
        self.owner = msg.newOwner;
    }

    receive(msg: ConfigureLaunchPhase) {
        throwUnless(73, sender() == self.owner);
        self.launchPool = msg.pool;
        self.transfersEnabled = msg.transfersEnabled;
    }

    receive(msg: EnableTransfers) {
        throwUnless(73, sender() == self.owner || sender() == self.launchPool);
        self.transfersEnabled = true;
    }

    receive(_: Slice) { throw(0xffff) }

    get fun get_jetton_data(): JettonMasterState {
        return JettonMasterState {
            totalSupply: self.totalSupply,
            mintable: true,
            adminAddress: self.owner,
            jettonContent: self.jettonContent,
            jettonWalletCode: codeOf JettonWallet,
            launchPool: self.launchPool,
            transfersEnabled: self.transfersEnabled,
        };
    }

    get fun get_wallet_address(ownerAddress: Address): Address {
        return getJettonWalletByOwner(ownerAddress, self.launchPool, self.transfersEnabled);
    }

    get fun get_launch_pool(): Address {
        return self.launchPool;
    }

    get fun get_transfers_enabled(): Bool {
        return self.transfersEnabled;
    }
}

asm fun emptyAddress(): Address { b{00} PUSHSLICE }

inline fun makeTakeWalletAddressMsg(targetJettonWallet: BasechainAddress, msg: ProvideWalletAddress): Cell {
    return beginCell()
        .storeUint(TakeWalletAddress.opcode(), 32)
        .storeUint(msg.queryId, 64)
        .storeBasechainAddress(targetJettonWallet)
        .storeMaybeRef(msg.includeAddress ? beginCell().storeAddress(msg.ownerAddress).endCell() : null)
        .endCell();
}

inline fun getJettonWalletInit(address: Address, launchPool: Address, transfersEnabled: Bool): StateInit {
    return initOf JettonWallet(address, myAddress(), 0, launchPool, transfersEnabled);
}

inline fun getJettonWalletByOwner(jettonWalletOwner: Address, launchPool: Address, transfersEnabled: Bool): Address {
    return contractAddress(getJettonWalletInit(jettonWalletOwner, launchPool, transfersEnabled));
}

inline fun getJettonBasechainWalletByOwner(jettonWalletOwner: Address, launchPool: Address, transfersEnabled: Bool): BasechainAddress {
    return contractBasechainAddress(getJettonWalletInit(jettonWalletOwner, launchPool, transfersEnabled));
}

inline extends fun isNotNone(self: Address): Bool { return self.asSlice().preloadUint(2) != 0 }
