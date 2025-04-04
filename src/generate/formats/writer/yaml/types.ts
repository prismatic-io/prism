import { BinaryOperator, BooleanOperator, UnaryOperator } from "@prismatic-io/spectral";

export type ValidComplexYAMLValue = Array<{
  type: string;
  value: ValidYAMLValue | ValidComplexYAMLValue | ConditionObjectFromYAML;
  name?:
    | string
    | {
        type: string;
        value: ValidYAMLValue;
        name?: string;
      };
}>;

export type ValidYAMLValue = string | Array<string | unknown> | number | boolean;

export type ConditionObjectFromYAML = Array<string | unknown>;

export type ComponentObjectFromYAML = {
  isPublic: boolean;
  key: string;
  version: number;
};

export type ActionObjectFromYAML = {
  action: {
    component: ComponentObjectFromYAML;
    key: string;
  };
  description: string;
  inputs: Record<
    string,
    {
      type: string;
      value: ValidYAMLValue | ValidComplexYAMLValue | Array<ValidComplexYAMLValue>;
    }
  >;
  formattedInputs?: string;
  isTrigger?: boolean;
  name: string;
  steps?: Array<ActionObjectFromYAML>;
  branches?: Array<{
    name: string;
    steps: Array<ActionObjectFromYAML>;
  }>;
  schedule?: {
    type?: string;
    value?: string;
    timezone: string;
    meta?: {
      scheduleType: string;
    };
  };

  // Added by prism during CNI generation
  loopString?: string;
  branchString?: string;
};

export type ConfigPageObjectFromYAML = {
  name: string;
  tagline?: string;
  elements: Array<{
    type: string;
    value: string;
  }>;
  userLevelConfigured?: boolean;
};

export type ConfigVarObjectFromYAML = {
  dataType: string;
  defaultValue?: string;
  description?: string;
  key: string;
  orgOnly?: boolean;
  collectionType?: string;
  connection?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
    key: string;
    dataType: string;
  };
  dataSource?: {
    component: {
      isPublic: boolean;
      key: string;
      version: number;
    };
    key: string;
    dataType: string;
  };
  inputs?: Record<
    string,
    {
      type: string;
      value: string;
      meta: {
        visibleToOrgDeployer: boolean;
        visibleToCustomerDeployer: boolean;
        orgOnly: boolean;
        writeOnly: boolean;
      };
    }
  >;
  meta?: {
    visibleToOrgDeployer: boolean;
    visibleToCustomerDeployer: boolean;
    orgOnly?: boolean;
  };
};

export type FlowObjectFromYAML = {
  endpointSecurityType: string;
  isSynchronous: boolean;
  name: string;
  description: string;
  steps: Array<ActionObjectFromYAML>;
};

export type IntegrationObjectFromYAML = {
  name: string;
  description: string;
  definitionVersion: number;
  flows: Array<FlowObjectFromYAML>;
  configPages: Array<{
    elements: Array<{
      type: string;
      value: string;
    }>;
    name: string;
    tagline?: string;
    userLeveLConfigured: boolean;
  }>;
  requiredConfigVars: Array<ConfigVarObjectFromYAML>;
};

/* These are taken from spectral's conditionalLogic evaluate method */
export const OPERATOR_PHRASE_TO_EXPRESSION: {
  [clause: string]: {
    expression: string;
    includes?: Array<string>;
  };
} = {
  [BinaryOperator.equal]: {
    expression: "isEqual($LEFT_TERM, $RIGHT_TERM)",
    includes: ["isEqual"],
  },
  [BinaryOperator.exactlyMatches]: {
    expression: "$LEFT_TERM === $RIGHT_TERM || isDeepEqual($LEFT_TERM, $RIGHT_TERM)",
    includes: ["isDeepEqual"],
  },
  [BinaryOperator.notEqual]: {
    expression: "!(isEqual($LEFT_TERM, $RIGHT_TERM))",
    includes: ["isEqual"],
  },
  [BinaryOperator.doesNotExactlyMatch]: {
    expression: "!($LEFT_TERM === $RIGHT_TERM || isDeepEqual($LEFT_TERM, $RIGHT_TERM))",
    includes: ["isDeepEqual"],
  },
  [BinaryOperator.greaterThan]: {
    expression: "$LEFT_TERM > $RIGHT_TERM",
  },
  [BinaryOperator.greaterThanOrEqual]: {
    expression: "$LEFT_TERM >= $RIGHT_TERM",
  },
  [BinaryOperator.lessThan]: {
    expression: "$LEFT_TERM < $RIGHT_TERM",
  },
  [BinaryOperator.lessThanOrEqual]: {
    expression: "$LEFT_TERM <= $RIGHT_TERM",
  },
  [BinaryOperator.in]: {
    expression: "contains($RIGHT_TERM, $LEFT_TERM)",
    includes: ["contains"],
  },
  [BinaryOperator.notIn]: {
    expression: "!contains($RIGHT_TERM, $LEFT_TERM)",
    includes: ["contains"],
  },
  [BinaryOperator.startsWith]: {
    expression: "$RIGHT_TERM.startsWith($LEFT_TERM)",
  },
  [BinaryOperator.doesNotStartWith]: {
    expression: "!$RIGHT_TERM.startsWith($LEFT_TERM)",
  },
  [BinaryOperator.endsWith]: {
    expression: "$RIGHT_TERM.endsWith($LEFT_TERM)",
  },
  [BinaryOperator.doesNotEndWith]: {
    expression: "!$RIGHT_TERM.endsWith($LEFT_TERM)",
  },
  [BinaryOperator.dateTimeAfter]: {
    expression: "dateIsAfter($LEFT_TERM, $RIGHT_TERM)",
    includes: ["dateIsAfter"],
  },
  [BinaryOperator.dateTimeBefore]: {
    expression: "dateIsBefore($LEFT_TERM, $RIGHT_TERM)",
    includes: ["dateIsBefore"],
  },
  [BinaryOperator.dateTimeSame]: {
    expression: "dateIsEqual($LEFT_TERM, $RIGHT_TERM)",
    includes: ["dateIsEqual"],
  },
  [BooleanOperator.and]: {
    expression: "$LEFT_TERM && $RIGHT_TERM",
  },
  [BooleanOperator.or]: {
    expression: "$LEFT_TERM || $RIGHT_TERM",
  },
  [UnaryOperator.isTrue]: {
    expression: "evaluatesTrue($LEFT_TERM)",
    includes: ["evaluatesTrue"],
  },
  [UnaryOperator.isFalse]: {
    expression: "evaluatesFalse($LEFT_TERM)",
    includes: ["evaluatesFalse"],
  },
  [UnaryOperator.doesNotExist]: {
    expression: "evaluatesNull($LEFT_TERM)",
    includes: ["evaluatesNull"],
  },
  [UnaryOperator.exists]: {
    expression: "!evaluatesNull($LEFT_TERM)",
    includes: ["evaluatesNull"],
  },
  [UnaryOperator.isEmpty]: {
    expression: "evaluatesEmpty($LEFT_TERM)",
    includes: ["evaluatesEmpty"],
  },
  [UnaryOperator.isNotEmpty]: {
    expression: "!evaluatesNull($LEFT_TERM)",
    includes: ["evaluatesNull"],
  },
};
