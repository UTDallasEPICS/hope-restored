// composables/useDailyCheck.ts
export const useDailyCheck = () => {
  const checkAndCreateNewDay = async () => {
    try {
      const response = await $fetch('/api/inventory/check-new-day', {
        method: 'POST',
      });
      
      if (response.recordsCreated) {
        console.log(`✅ New day detected: Created ${response.count} inventory records for ${new Date(response.date).toLocaleDateString()}`);
      } else {
        console.log(`✓ Today's inventory records already exist`);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to check/create new day:', error);
      throw error;
    }
  };

  return {
    checkAndCreateNewDay,
  };
};
