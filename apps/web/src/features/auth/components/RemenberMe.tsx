import Checkbox from './checkbox/Checkbox';
import type { CheckboxProps } from './checkbox/Checkbox.types';

export default function RememberMe({
  checked,
  onChange,
}: Pick<CheckboxProps, 'checked' | 'onChange'>) {
  return <Checkbox checked={checked} onChange={onChange} label='Remember me' />;
}