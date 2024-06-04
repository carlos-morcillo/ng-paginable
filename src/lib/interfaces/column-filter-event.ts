export interface MenuFilterValue {
	operator: MenuFilterOperators;
	rules: Array<MenuFilterRule>;
}

export interface MenuFilterRule {
	value: string | null;
	matchMode: MatchMode;
}

export enum MenuFilterOperators {
	Or = 'or',
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

export type MatchMode =
	| keyof StringMatchModes
	| NumberMatchModes
	| DateMatchModes;
