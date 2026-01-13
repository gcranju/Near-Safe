/**
 * NEAR Multisig Contract SDK Functions
 * For sodax.sputnik-dao.near
 */

const NEAR_RPC_URL = 'https://rpc.mainnet.near.org';
const CONTRACT_ID = 'sodax.sputnik-dao.near';

interface RPCRequest {
    jsonrpc: string;
    id: string;
    method: string;
    params: {
        request_type: string;
        finality: string;
        account_id: string;
        method_name: string;
        args_base64: string;
    };
}

interface RPCResponse {
    result?: {
        result: number[];
    };
    error?: {
        message: string;
    };
}

interface Policy {
    roles: Array<{
        name: string;
        kind: string;
        permissions: string[];
        vote_policy: any;
    }>;
    default_vote_policy: any;
    proposal_bond: string;
    proposal_period: string;
    bounty_bond: string;
    bounty_forgiveness_period: string;
}

interface Proposal {
    id: number;
    proposer: string;
    description: string;
    kind: any;
    status: string;
    vote_counts: any;
    votes: any;
    submission_time: string;
}

interface ProposalInput {
    description: string;
    kind: ProposalKind;
}

type ProposalKind = 
    | { Transfer: { token_id: string; receiver_id: string; amount: string; msg?: string } }
    | { AddMemberToRole: { member_id: string; role: string } }
    | { RemoveMemberFromRole: { member_id: string; role: string } }
    | { FunctionCall: { receiver_id: string; actions: Array<{ method_name: string; args: string; deposit: string; gas: string }> } }
    | { UpgradeRemote: { receiver_id: string; method_name: string; code_hash: string } }
    | { UpgradeSelf: { hash: string } }
    | { SetStakingContract: { staking_id: string } }
    | { AddBounty: { bounty: any } }
    | { BountyDone: { bounty_id: number; receiver_id: string } }
    | { Vote: any }
    | { FactoryInfoUpdate: { factory_info: any } }
    | { ChangePolicyAddOrUpdateRole: { role: any } }
    | { ChangePolicyRemoveRole: { role: string } }
    | { ChangePolicyUpdateDefaultVotePolicy: { vote_policy: any } }
    | { ChangePolicyUpdateParameters: { parameters: any } };

enum Vote {
    Approve = 'VoteApprove',
    Reject = 'VoteReject',
}

/**
 * Make a view call to a NEAR contract
 * @param contractId - The contract account ID
 * @param methodName - The method name to call
 * @param args - The arguments to pass to the method
 * @returns The decoded result
 */
async function viewCall<T = any>(
    contractId: string,
    methodName: string,
    args: Record<string, any> = {}
): Promise<T> {
    const response = await fetch(NEAR_RPC_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'dontcare',
            method: 'query',
            params: {
                request_type: 'call_function',
                finality: 'final',
                account_id: contractId,
                method_name: methodName,
                args_base64: btoa(JSON.stringify(args)),
            },
        } as RPCRequest),
    });

    const data: RPCResponse = await response.json();

    if (data.error) {
        throw new Error(data.error.message || 'RPC call failed');
    }

    if (!data.result) {
        throw new Error('No result in response');
    }

    const result = data.result.result;
    const decodedResult = new TextDecoder().decode(new Uint8Array(result));
    return JSON.parse(decodedResult);
}

// ============================================================================
// VIEW METHODS (Read-only)
// ============================================================================

/**
 * Get the policy of the DAO
 * @returns The policy object
 */
export async function getPolicy(): Promise<Policy> {
    return await viewCall<Policy>(CONTRACT_ID, 'get_policy', {});
}

/**
 * Get proposals from the DAO
 * @param fromIndex - Starting index (default: 0)
 * @param limit - Maximum number of proposals to fetch (default: 100)
 * @returns Array of proposal objects
 */
export async function getProposals(
    fromIndex: number = 0,
    limit: number = 100
): Promise<Proposal[]> {
    const proposals = await viewCall<Proposal[]>(CONTRACT_ID, 'get_proposals', {
        from_index: fromIndex,
        limit: limit,
    });

    console.log(proposals);

    return proposals;
}

/**
 * Get filtered proposals by status
 * @returns Object with approved and pending proposals
 */
export async function getFilteredProposals(): Promise<{ approved: Proposal[], pending: Proposal[] }> {
    const proposals = await getProposals(0, 100);

    return {
        approved: proposals.filter((p) => p.status == 'Approved').reverse(), 
        pending: proposals.filter((p) => p.status != 'Approved' && p.status != 'Rejected').reverse(),
    };
}

/**
 * Get a single proposal by ID
 * @param proposalId - The proposal ID
 * @returns The proposal object
 */
export async function getProposal(proposalId: number): Promise<Proposal> {
    return await viewCall<Proposal>(CONTRACT_ID, 'get_proposal', {
        id: proposalId,
    });
}

/**
 * Get the number of proposals
 * @returns The total number of proposals
 */
export async function getNumProposals(): Promise<number> {
    return await viewCall<number>(CONTRACT_ID, 'get_num_proposals', {});
}

/**
 * Get the last proposal ID
 * @returns The last proposal ID
 */
export async function getLastProposalId(): Promise<number> {
    return await viewCall<number>(CONTRACT_ID, 'get_last_proposal_id', {});
}

// ============================================================================
// CHANGE METHODS (Require wallet signature - prepare transaction data)
// ============================================================================

/**
 * Prepare transaction data for adding a proposal
 * This returns the data needed to sign with a NEAR wallet
 * @param proposal - The proposal to add
 * @param deposit - Optional deposit amount in yoctoNEAR (default from policy)
 * @returns Transaction arguments for wallet signing
 */
export function prepareAddProposal(proposal: ProposalInput, deposit?: string) {
    return {
        contractId: CONTRACT_ID,
        method: 'add_proposal',
        args: {
            proposal
        },
        gas: '200000000000000', // 200 TGas
        deposit: deposit || '100000000000000000000000', // 0.1 NEAR default
    };
}

/**
 * Prepare transaction data for voting on a proposal
 * @param proposalId - The proposal ID to vote on
 * @param action - Vote action (Approve, Reject, or Remove)
 * @returns Transaction arguments for wallet signing
 */
export function prepareVote(proposalId: number, action: Vote) {
    return {
        contractId: CONTRACT_ID,
        method: 'act_proposal',
        args: {
            id: proposalId,
            action
        },
        gas: '200000000000000', // 200 TGas
        deposit: '0'
    };
}

/**
 * Prepare transaction data for executing an approved proposal
 * @param proposalId - The proposal ID to execute
 * @returns Transaction arguments for wallet signing
 */
export function prepareActProposal(proposalId: number, action: Vote) {
    return {
        contractId: CONTRACT_ID,
        methodName: 'act_proposal',
        args: {
            id: proposalId,
            action
        },
        gas: '200000000000000', // 200 TGas
        deposit: '0'
    };
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON PROPOSAL TYPES
// ============================================================================

/**
 * Create a transfer proposal
 */
export function createTransferProposal(
    description: string,
    receiverId: string,
    amount: string,
    tokenId: string = ''
): ProposalInput {
    return {
        description,
        kind: {
            Transfer: {
                token_id: tokenId,
                receiver_id: receiverId,
                amount,
            }
        }
    };
}

/**
 * Create an add member proposal
 */
export function createAddMemberProposal(
    description: string,
    memberId: string,
    role: string = 'council'
): ProposalInput {
    return {
        description,
        kind: {
            AddMemberToRole: {
                member_id: memberId,
                role
            }
        }
    };
}

/**
 * Create a remove member proposal
 */
export function createRemoveMemberProposal(
    description: string,
    memberId: string,
    role: string = 'council'
): ProposalInput {
    return {
        description,
        kind: {
            RemoveMemberFromRole: {
                member_id: memberId,
                role
            }
        }
    };
}

/**
 * Create a change threshold proposal
 */
export function createChangeThresholdProposal(
    description: string,
    threshold: number
): ProposalInput {
    return {
        description,
        kind: {
            ChangePolicyUpdateDefaultVotePolicy: {
                vote_policy: {
                  quorum: "0",
                  threshold : [
                    threshold,
                    100
                  ],
                  weight_kind: "RoleWeight"
            }
            }
        }
    };
}

/**
 * Create a function call proposal
 */
export function createFunctionCallProposal(
    description: string,
    receiverId: string,
    methodName: string,
    args: string,
    deposit: string = '0',
    gas: string = '100000000000000'
): ProposalInput {
    return {
        description,
        kind: {
            FunctionCall: {
                receiver_id: receiverId,
                actions: [{
                    method_name: methodName,
                    args: args,
                    deposit,
                    gas
                }]
            }
        }
    };
}

/**
 * Generic view call function for custom methods
 */
export { viewCall };

/**
 * Export constants
 */
export { CONTRACT_ID, NEAR_RPC_URL };

/**
 * Export types
 */
export type { Policy, Proposal, ProposalInput, ProposalKind };
export { Vote };