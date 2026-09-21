// import memoryStoreEngine from "@brain/memory.store.js";

// const result = await memoryStoreEngine.execute({
//   userPublicId: "test-user",
//   content: "The user is building SIA as a personal AI assistant.",
//   category: "project",
//   importance: 0.9,
// });

// console.log("Memory Stored:",result);

import memoryRetriveEngine from "@pipes/retrieve.pipe.js";

const result = await memoryRetriveEngine.execute({
  userPublicId : "4d0a713e-7b4f-4c14-a914-9932e6e1f263",
  query : "what is my main AI project?",
  topK : 5,
  similarityThreshold : 0.7
});

console.log(result)