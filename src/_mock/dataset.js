import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const dataset = [...Array(10)].map((_, index) => ({
  id: faker.datatype.uuid(),
 // avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
 // name: faker.name.fullName(),
  name:  sample([
    'example_file',
    'demo_file',
    'librabry_dataset',
    'covid_dataset',
    'mongoose_dataset',
    'pinterest_image',
    'social_media_platforms',
    'demo_database',
    'planspiel_report',
    'latest_trends',
  ]),
 // company: faker.company.name(),
 type:sample([
  'pdf',
  'txt',
  'json',
  'json',
  'json',
  'image',
  'pdf',
  'csv',
  'pdf',
  'pdf',
]),
  isBlocked: faker.datatype.boolean(),
  status: sample(['private', 'private','public', 'private','private', 'public','public', 'private']),
  size: sample([
    '1.2 MB',
    '1 GB',
    '2.5 MB',
    '1.689 KB',
    '3.45 GB',
    '267 MB',
    '458 KB',
    '8.5 MB',
    '598 KB',
    '20.45 MB',
  ]),
}));

export default dataset;
