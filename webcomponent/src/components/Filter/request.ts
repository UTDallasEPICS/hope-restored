async function fetchLanguages(): Promise<string[]> {
  try {
    const response: Response = await fetch(
      `${import.meta.env.VITE_NUXT_ENV_API_URL}/api/language/get/all`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(`Error fetching language: ${response.statusText}`);
    }

    // Log the response text to debug
    const text = await response.text();
    console.log('Response text:', text);
    
    const data = await response.json();
    return data.map((language: any) => language.name);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default {
  fetchLanguages,
};
