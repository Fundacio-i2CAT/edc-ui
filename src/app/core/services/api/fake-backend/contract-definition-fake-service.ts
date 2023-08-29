import {
  ContractDefinitionEntry,
  ContractDefinitionPage,
  IdResponseDto,
} from '@sovity.de/edc-client';
import {ContractDefinitionRequest} from '@sovity.de/edc-client/dist/generated/models/ContractDefinitionRequest';
import {AssetProperties} from '../../asset-properties';

export let contractDefinitions: ContractDefinitionEntry[] = [
  {
    contractDefinitionId: 'test-contract-definition-1',
    contractPolicyId: 'test-policy-definition-1',
    accessPolicyId: 'test-policy-definition-1',
    assetSelector: [
      {
        operandLeft: AssetProperties.id,
        operator: 'EQ',
        operandRight: {type: 'VALUE', value: 'test-asset-1'},
      },
    ],
  },
];

export const contractDefinitionPage = (): ContractDefinitionPage => {
  return {
    contractDefinitions,
  };
};

export const createContractDefinition = (
  request: ContractDefinitionRequest,
): IdResponseDto => {
  let newEntry: ContractDefinitionEntry = {
    contractDefinitionId: request.contractDefinitionId!,
    contractPolicyId: request.contractPolicyId!,
    accessPolicyId: request.accessPolicyId!,
    assetSelector: request.assetSelector!,
  };

  contractDefinitions = [newEntry, ...contractDefinitions];

  return {
    id: newEntry.contractDefinitionId,
    lastUpdatedDate: new Date(),
  };
};

export const deleteContractDefinition = (id: string): IdResponseDto => {
  contractDefinitions = contractDefinitions.filter(
    (it) => it.contractDefinitionId !== id,
  );
  return {id, lastUpdatedDate: new Date()};
};
