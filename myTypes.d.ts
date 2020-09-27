import AbstBaseModel from './src/Default/AbstBaseModel';
import AbstConverter from './src/Default/AbstConverter';

declare global {
  const AbstBaseModel: AbstBaseModel;
  const AbstConverter: AbstConverter;
}
