// parallelExecutor.js handles running tasks that don't depend on each other concurrently.

module.exports = {
  executeParallel: async (tasks) => {
    // tasks is an array of async functions
    try {
      const results = await Promise.all(tasks.map(task => task()));
      return results;
    } catch (error) {
      console.error("Error in parallel execution", error);
      throw error;
    }
  }
};
