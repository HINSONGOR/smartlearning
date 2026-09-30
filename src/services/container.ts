import { essaySchema, exampleSchema, vocabularySchema } from "@/domain/schemas";
import { createBrowserStore, type KeyValueStore } from "@/repositories/local/keyValueStore";
import { LocalCrudRepository } from "@/repositories/local/LocalCrudRepository";
import { LocalCurriculumRepository } from "@/repositories/local/LocalCurriculumRepository";
import { seedData } from "@/repositories/local/seedData";
import { ChangeNotifier } from "./changes";
import { CurriculumService } from "./CurriculumService";
import { EssayService } from "./EssayService";
import { ExampleService } from "./ExampleService";
import { VocabularyService } from "./VocabularyService";

/**
 * 唯一組裝 Service 同 Repository 嘅地方。
 * 將來轉用雲端資料庫，只需要喺呢度換 Repository 實作，UI 同 Service 都唔使改。
 */
export function createServices(store: KeyValueStore) {
  const changes = new ChangeNotifier();
  return {
    changes,
    curriculum: new CurriculumService(new LocalCurriculumRepository(seedData)),
    essays: new EssayService(
      new LocalCrudRepository("essays", seedData.essays, essaySchema, store),
      essaySchema,
      changes,
    ),
    vocabulary: new VocabularyService(
      new LocalCrudRepository("vocabulary", seedData.vocabulary, vocabularySchema, store),
      vocabularySchema,
      changes,
    ),
    examples: new ExampleService(
      new LocalCrudRepository("examples", seedData.examples, exampleSchema, store),
      exampleSchema,
      changes,
    ),
  };
}

export type Services = ReturnType<typeof createServices>;

let instance: Services | undefined;

/** 伺服器端冇 localStorage，只會讀到 /data 預設教材 */
export function getServices(): Services {
  instance ??= createServices(createBrowserStore());
  return instance;
}
