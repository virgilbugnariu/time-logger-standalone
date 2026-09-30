import { isEmpty } from 'lodash';

interface ValidationRuleWithConfig {
  message: string;
  [key: string]: any;
}

export type ValidationRule = string | ValidationRuleWithConfig;

interface LengthValidationRule {
  message: string;
  min: number;
}

export function isValidationRuleWithConfig<T>(rule: ValidationRuleWithConfig | T): rule is ValidationRuleWithConfig {
  return !!(rule as unknown as ValidationRuleWithConfig)?.message;
}

export default function validate(data: any, rules: Record<string, ValidationRule>) {
  const error = Object.keys(rules).find((rule: string) => {
    if (rule === 'required') {
      return isEmpty((data || '').trim()) ? rule : '';
    }

    if (rule === 'file-uploaded') {
      return !data ? rule : '';
    }

    if (rule === 'length') {
      const min = (rules[rule] as LengthValidationRule)?.min || 0;
      return (data || []).length < min ? rule : ''
    }

    return '';
  });

  if (error) {
    const rule = rules[error];
    return isValidationRuleWithConfig(rule) ? rule.message : rule;
  }

  return ''
}

