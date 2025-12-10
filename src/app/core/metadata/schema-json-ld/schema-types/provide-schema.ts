import { PersonSchemaType } from './Person/person-schema-type';
import { ProductCreativeWorkSchemaType } from './product/product-creative-work-schema-type';
import { ProductDatasetSchemaType } from './product/product-dataset-schema-type';
import { PublicationBookSchemaType } from './publication/publication-book-schema-type';
import { PublicationChapterSchemaType } from './publication/publication-chapter-schema-type';
import { PublicationCreativeWorkSchemaType } from './publication/publication-creative-work-schema-type';
import { PublicationReportSchemaType } from './publication/publication-report-schema-type';
import { PublicationScholarlyArticleSchemaType } from './publication/publication-scholarly-article-schema-type';
import { PublicationThesisSchemaType } from './publication/publication-thesis-schema-type';

/**
 * Declaration needed to make sure all decorator functions are called in time
 */
export const schemaModels = [
  PersonSchemaType,
  ProductCreativeWorkSchemaType,
  ProductDatasetSchemaType,
  PublicationBookSchemaType,
  PublicationChapterSchemaType,
  PublicationCreativeWorkSchemaType,
  PublicationReportSchemaType,
  PublicationScholarlyArticleSchemaType,
  PublicationThesisSchemaType,
];
