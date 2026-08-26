/**
 * Represents a structured filter composed of multiple filtering rules.
 * Each rule is evaluated according to the specified logical operator (AND / OR).
 */
export interface MenuFilterValue {
	/**
	 * Logical operator used to combine the filtering rules.
	 * - "and": all rules must match
	 * - "or": at least one rule must match
	 */
	operator: MenuFilterOperators;

	/**
	 * Array of individual filtering rules to apply.
	 */
	rules: Array<MenuFilterRule>;
}

/**
 * Represents a single filtering rule consisting of a value and a matching mode.
 * This rule can be evaluated against a data field to determine a match.
 */
export interface MenuFilterRule {
	/**
	 * Value to match against. It can be a string or null.
	 */
	value: string | null;

	/**
	 * Mode of matching to apply. This defines how the value is compared,
	 * e.g., "equals", "contains", etc., as defined in the MatchModes enum.
	 */
	matchMode: MatchModes;
}

/**
 * Enum representing the logical operators used to combine multiple filter rules.
 */
export enum MenuFilterOperators {
	/**
	 * Logical OR: at least one rule must match.
	 */
	Or = 'or',

	/**
	 * Logical AND: all rules must match.
	 */
	And = 'and'
}

export enum StringMatchModes {
	StartsWith = 'StartsWith',
	Contains = 'Contains',
	NotContains = 'NotContains',
	EndsWith = 'EndsWith',
	Equal = 'Equal',
	NotEqual = 'NotEqual'
}

export enum NumberMatchModes {
	GreaterThan = 'GreaterThan',
	GreaterThanOrEqual = 'GreaterThanOrEqual',
	LessThan = 'LessThan',
	LessThanOrEqual = 'LessThanOrEqual',
	Equal = 'Equal',
	NotEqual = 'NotEqual'
}

export enum DateMatchModes {
	Equal = 'Equal',
	NotEqual = 'NotEqual',
	Before = 'Before',
	BeforeOrEqual = 'BeforeOrEqual',
	After = 'After',
	AfterOrEqual = 'AfterOrEqual'
}

export enum BooleanMatchModes {
	Equal = 'Equal',
	NotEqual = 'NotEqual'
}

export enum NullMatchModes {
	IsNull = 'IsNull',
	IsNotNull = 'IsNotNull'
}

export type MatchModes = NullMatchModes | StringMatchModes | NumberMatchModes | DateMatchModes | BooleanMatchModes;
