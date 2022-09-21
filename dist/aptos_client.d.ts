import { HexString, MaybeHexString } from "./hex_string";
import { AptosAccount } from "./aptos_account";
import * as Gen from "./generated/index";
import { TxnBuilderTypes, BCS } from "./transaction_builder";
/**
 * Provides methods for retrieving data from Aptos node.
 * For more detailed API specification see {@link https://fullnode.devnet.aptoslabs.com/v1/spec}
 */
export declare class AptosClient {
    client: Gen.AptosGeneratedClient;
    nodeUrl: string;
    /**
     * Build a client configured to connect to an Aptos node at the given URL.
     *
     * Note: If you forget to append `/v1` to the URL, the client constructor
     * will automatically append it. If you don't want this URL processing to
     * take place, set doNotFixNodeUrl to true.
     *
     * @param nodeUrl URL of the Aptos Node API endpoint.
     * @param config Additional configuration options for the generated Axios client.
     */
    constructor(nodeUrl: string, config?: Partial<Gen.OpenAPIConfig>, doNotFixNodeUrl?: boolean);
    /**
     * Queries an Aptos account by address
     * @param accountAddress Hex-encoded 32 byte Aptos account address
     * @returns Core account resource, used for identifying account and transaction execution
     * @example An example of the returned account
     * ```
     * {
     *    sequence_number: "1",
     *    authentication_key: "0x5307b5f4bc67829097a8ba9b43dba3b88261eeccd1f709d9bde240fc100fbb69"
     * }
     * ```
     */
    getAccount(accountAddress: MaybeHexString): Promise<Gen.AccountData>;
    /**
     * Queries transactions sent by given account
     * @param accountAddress Hex-encoded 32 byte Aptos account address
     * @param query Optional pagination object
     * @param query.start The start transaction version of the page. Default is the latest ledger version
     * @param query?.limit The max number of transactions should be returned for the page. Default is 25.
     * @returns An array of on-chain transactions, sent by account
     */
    getAccountTransactions(accountAddress: MaybeHexString, query?: {
        start?: BigInt | number;
        limit?: number;
    }): Promise<Gen.Transaction[]>;
    /**
     * Queries modules associated with given account
     * @param accountAddress Hex-encoded 32 byte Aptos account address
     * @param query.version Specifies ledger version of transactions. By default latest version will be used
     * @returns Account modules array for a specific ledger version.
     * Module is represented by MoveModule interface. It contains module `bytecode` and `abi`,
     * which is JSON representation of a module
     */
    getAccountModules(accountAddress: MaybeHexString, query?: {
        ledgerVersion?: BigInt | number;
    }): Promise<Gen.MoveModuleBytecode[]>;
    /**
     * Queries module associated with given account by module name
     * @param accountAddress Hex-encoded 32 byte Aptos account address
     * @param moduleName The name of the module
     * @param query.version Specifies ledger version of transactions. By default latest version will be used
     * @returns Specified module.
     * Module is represented by MoveModule interface. It contains module `bytecode` and `abi`,
     * which JSON representation of a module
     */
    getAccountModule(accountAddress: MaybeHexString, moduleName: string, query?: {
        ledgerVersion?: BigInt | number;
    }): Promise<Gen.MoveModuleBytecode>;
    /**
     * Queries all resources associated with given account
     * @param accountAddress Hex-encoded 32 byte Aptos account address
     * @param query.version Specifies ledger version of transactions. By default latest version will be used
     * @returns Account resources for a specific ledger version
     * @example An example of an account resource
     * ```
     * {
     *    type: "0x1::AptosAccount::Coin",
     *    data: { value: 6 }
     * }
     * ```
     */
    getAccountResources(accountAddress: MaybeHexString, query?: {
        ledgerVersion?: BigInt | number;
    }): Promise<Gen.MoveResource[]>;
    /**
     * Queries resource associated with given account by resource type
     * @param accountAddress Hex-encoded 32 byte Aptos account address
     * @param resourceType String representation of an on-chain Move struct type
     * @param query.version Specifies ledger version of transactions. By default latest version will be used
     * @returns Account resource of specified type and ledger version
     * @example An example of an account resource
     * ```
     * {
     *    type: "0x1::AptosAccount::Coin",
     *    data: { value: 6 }
     * }
     * ```
     */
    getAccountResource(accountAddress: MaybeHexString, resourceType: Gen.MoveStructTag, query?: {
        ledgerVersion?: BigInt | number;
    }): Promise<Gen.MoveResource>;
    /** Generates a signed transaction that can be submitted to the chain for execution. */
    static generateBCSTransaction(accountFrom: AptosAccount, rawTxn: TxnBuilderTypes.RawTransaction): Uint8Array;
    /** Generates a BCS transaction that can be submitted to the chain for simulation. */
    static generateBCSSimulation(accountFrom: AptosAccount, rawTxn: TxnBuilderTypes.RawTransaction): Uint8Array;
    /** Generates a transaction request that can be submitted to produce a raw transaction that
     * can be signed, which upon being signed can be submitted to the blockchain
     * @param sender Hex-encoded 32 byte Aptos account address of transaction sender
     * @param payload Transaction payload. It depends on transaction type you want to send
     * @param options Options allow to overwrite default transaction options.
     * Defaults are:
     * ```bash
     *   {
     *     sender: senderAddress.hex(),
     *     sequence_number: account.sequence_number,
     *     max_gas_amount: "1000",
     *     gas_unit_price: "1",
     *     // Unix timestamp, in seconds + 10 seconds
     *     expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 10).toString(),
     *   }
     * ```
     * @returns A transaction object
     */
    generateTransaction(sender: MaybeHexString, payload: Gen.EntryFunctionPayload, options?: Partial<Gen.SubmitTransactionRequest>): Promise<TxnBuilderTypes.RawTransaction>;
    /** Converts a transaction request produced by `generateTransaction` into a properly
     * signed transaction, which can then be submitted to the blockchain
     * @param accountFrom AptosAccount of transaction sender
     * @param rawTransaction A raw transaction generated by `generateTransaction` method
     * @returns A transaction, signed with sender account
     */
    signTransaction(accountFrom: AptosAccount, rawTransaction: TxnBuilderTypes.RawTransaction): Promise<Uint8Array>;
    /**
     * Queries events by event key
     * @param eventKey Event key for an event stream. It is BCS serialized bytes
     * of `guid` field in the Move struct `EventHandle`
     * @returns Array of events assotiated with given key
     */
    getEventsByEventKey(eventKey: string): Promise<Gen.Event[]>;
    /**
     * Extracts event key from the account resource identified by the
     * `event_handle_struct` and `field_name`, then returns events identified by the event key
     * @param address Hex-encoded 32 byte Aptos account from which events are queried
     * @param eventHandleStruct String representation of an on-chain Move struct type.
     * (e.g. `0x1::Coin::CoinStore<0x1::aptos_coin::AptosCoin>`)
     * @param fieldName The field name of the EventHandle in the struct
     * @param query Optional query object
     * @param query.start The start sequence number in the EVENT STREAM, defaulting to the latest event.
     * The events are returned in the reverse order of sequence number
     * @param query?.limit The number of events to be returned for the page default is 5
     * @returns Array of events
     */
    getEventsByEventHandle(address: MaybeHexString, eventHandleStruct: Gen.MoveStructTag, fieldName: string, query?: {
        start?: BigInt | number;
        limit?: number;
    }): Promise<Gen.Event[]>;
    /**
     * Submits a signed transaction to the transaction endpoint.
     * @param signedTxn A transaction, signed by `signTransaction` method
     * @returns Transaction that is accepted and submitted to mempool
     */
    submitTransaction(signedTxn: Uint8Array): Promise<Gen.PendingTransaction>;
    /** Submits a transaction with fake signature to the transaction simulation endpoint. */
    simulateTransaction(accountFrom: AptosAccount, rawTransaction: TxnBuilderTypes.RawTransaction): Promise<Gen.UserTransaction[]>;
    /**
     * Submits a signed transaction to the the endpoint that takes BCS payload
     * @param signedTxn A BCS transaction representation
     * @returns Transaction that is accepted and submitted to mempool
     */
    submitSignedBCSTransaction(signedTxn: Uint8Array): Promise<Gen.PendingTransaction>;
    /**
     * Submits a signed transaction to the the endpoint that takes BCS payload
     * @param signedTxn output of generateBCSSimulation()
     * @returns Simulation result in the form of UserTransaction
     */
    submitBCSSimulation(bcsBody: Uint8Array): Promise<Gen.UserTransaction[]>;
    /**
     * Queries on-chain transactions
     * @param query Optional pagination object
     * @param query.start The start transaction version of the page. Default is the latest ledger version
     * @param query?.limit The max number of transactions should be returned for the page. Default is 25
     * @returns Array of on-chain transactions
     */
    getTransactions(query?: {
        start?: BigInt | number;
        limit?: number;
    }): Promise<Gen.Transaction[]>;
    /**
     * @param txnHashOrVersion - Transaction hash should be hex-encoded bytes string with 0x prefix.
     * Transaction version is an uint64 number.
     * @returns Transaction from mempool or on-chain transaction
     */
    getTransactionByHash(txnHash: string): Promise<Gen.Transaction>;
    /**
     * @param txnHashOrVersion - Transaction hash should be hex-encoded bytes string with 0x prefix.
     * Transaction version is an uint64 number.
     * @returns Transaction from mempool or on-chain transaction
     */
    getTransactionByVersion(txnVersion: BigInt | number): Promise<Gen.Transaction>;
    /**
     * Defines if specified transaction is currently in pending state
     * @param txnHash A hash of transaction
     *
     * To create a transaction hash:
     *
     * 1. Create hash message bytes: "Aptos::Transaction" bytes + BCS bytes of Transaction.
     * 2. Apply hash algorithm SHA3-256 to the hash message bytes.
     * 3. Hex-encode the hash bytes with 0x prefix.
     *
     * @returns `true` if transaction is in pending state and `false` otherwise
     */
    transactionPending(txnHash: string): Promise<boolean>;
    /**
     * Wait for a transaction to move past pending state.
     *
     * There are 4 possible outcomes:
     * 1. Transaction is processed and successfully committed to the blockchain.
     * 2. Transaction is rejected for some reason, and is therefore not committed
     *    to the blockchain.
     * 3. Transaction is committed but execution failed, meaning no changes were
     *    written to the blockchain state.
     * 4. Transaction is not processed within the specified timeout.
     *
     * In case 1, this function resolves with the transaction response returned
     * by the API.
     *
     * In case 2, the function will throw an ApiError, likely with an HTTP status
     * code indicating some problem with the request (e.g. 400).
     *
     * In case 3, if `checkSuccess` is false (the default), this function returns
     * the transaction response just like in case 1, in which the `success` field
     * will be false. If `checkSuccess` is true, it will instead throw a
     * FailedTransactionError.
     *
     * In case 4, this function throws a WaitForTransactionError.
     *
     * @param txnHash The hash of a transaction previously submitted to the blockchain.
     * @param timeoutSecs Timeout in seconds. Defaults to 10 seconds.
     * @param checkSuccess See above. Defaults to false.
     * @returns See above.
     *
     * @example
     * ```
     * const rawTransaction = await this.generateRawTransaction(sender.address(), payload, extraArgs);
     * const bcsTxn = AptosClient.generateBCSTransaction(sender, rawTransaction);
     * const pendingTransaction = await this.submitSignedBCSTransaction(bcsTxn);
     * const transasction = await this.aptosClient.waitForTransactionWithResult(pendingTransaction.hash);
     * ```
     */
    waitForTransactionWithResult(txnHash: string, extraArgs?: {
        timeoutSecs?: number;
        checkSuccess?: boolean;
    }): Promise<Gen.Transaction>;
    /**
     * This function works the same as `waitForTransactionWithResult` except it
     * doesn't return the transaction in those cases, it returns nothing. For
     * more information, see the documentation for `waitForTransactionWithResult`.
     */
    waitForTransaction(txnHash: string, extraArgs?: {
        timeoutSecs?: number;
        checkSuccess?: boolean;
    }): Promise<void>;
    /**
     * Queries the latest ledger information
     * @param params Request params
     * @returns Latest ledger information
     * @example Example of returned data
     * ```
     * {
     *   chain_id: 15,
     *   epoch: 6,
     *   ledgerVersion: "2235883",
     *   ledger_timestamp:"1654580922321826"
     * }
     * ```
     */
    getLedgerInfo(): Promise<Gen.IndexResponse>;
    /**
     * @returns Current chain id
     */
    getChainId(): Promise<number>;
    /**
     * Gets a table item for a table identified by the handle and the key for the item.
     * Key and value types need to be passed in to help with key serialization and value deserialization.
     * @param handle A pointer to where that table is stored
     * @param data Object, that describes table item
     * @param data.key_type Move type of table key (e.g. `vector<u8>`)
     * @param data.value_type Move type of table value (e.g. `u64`)
     * @param data.key Value of table key
     * @param params Request params
     * @returns Table item value rendered in JSON
     */
    getTableItem(handle: string, data: Gen.TableItemRequest, query?: {
        ledgerVersion?: BigInt | number;
    }): Promise<any>;
    /**
     * Generates a raw transaction out of a transaction payload
     * @param accountFrom
     * @param payload
     * @param extraArgs
     * @returns
     */
    generateRawTransaction(accountFrom: HexString, payload: TxnBuilderTypes.TransactionPayload, extraArgs?: {
        maxGasAmount?: BCS.Uint64;
        gasUnitPrice?: BCS.Uint64;
        expireTimestamp?: BCS.Uint64;
    }): Promise<TxnBuilderTypes.RawTransaction>;
    /**
     * Helper for generating, signing, and submitting a transaction.
     *
     * @param sender AptosAccount of transaction sender.
     * @param payload Transaction payload.
     * @param extraArgs Extra args for building the transaction payload.
     * @returns The transaction response from the API.
     */
    generateSignSubmitTransaction(sender: AptosAccount, payload: TxnBuilderTypes.TransactionPayload, extraArgs?: {
        maxGasAmount?: BCS.Uint64;
        gasUnitPrice?: BCS.Uint64;
        expireTimestamp?: BCS.Uint64;
    }): Promise<string>;
    /**
     * Helper for generating, submitting, and waiting for a transaction, and then
     * checking whether it was committed successfully. Under the hood this is just
     * `generateSignSubmitTransaction` and then `waitForTransactionWithResult`, see
     * those for information about the return / error semantics of this function.
     */
    generateSignSubmitWaitForTransaction(sender: AptosAccount, payload: TxnBuilderTypes.TransactionPayload, extraArgs?: {
        maxGasAmount?: BCS.Uint64;
        gasUnitPrice?: BCS.Uint64;
        expireTimestamp?: BCS.Uint64;
        checkSuccess?: boolean;
        timeoutSecs?: number;
    }): Promise<Gen.Transaction>;
}
/**
 * This error is used by `waitForTransactionWithResult` when waiting for a
 * transaction times out.
 */
export declare class WaitForTransactionError extends Error {
    readonly lastSubmittedTransaction: Gen.Transaction | undefined;
    constructor(message: string, lastSubmittedTransaction: Gen.Transaction | undefined);
}
/**
 * This error is used by `waitForTransactionWithResult` if `checkSuccess` is true.
 * See that function for more information.
 */
export declare class FailedTransactionError extends Error {
    readonly transaction: Gen.Transaction;
    constructor(message: string, transaction: Gen.Transaction);
}
//# sourceMappingURL=aptos_client.d.ts.map