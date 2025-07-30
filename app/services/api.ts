const API_URL = "http://192.168.0.171/liwad-api";

type RegisterForm = {
  fullname: string;
  contact_number: string;
  sex: string;
  city: string;
  barangay: string;
  street: string;
  email: string;
  password: string;
};

export const registerUser = async (form: RegisterForm): Promise<any> => {
  try {
    const res = await fetch(`${API_URL}/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), 
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch("http://192.168.0.171/liwad-api/login.php", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({ email, password }),
    });

    const rawText = await response.text();
console.log("📦 Raw response from server:", rawText);

let result;
try {
  result = JSON.parse(rawText);
} catch (err) {
  console.error("❌ JSON parsing failed", err);
  throw new Error("Server did not return JSON.");
}

    return result;
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

export const fetchUserReports = async (user_id: string) => {
  try {
    const res = await fetch(`${API_URL}/get_reports.php?user_id=${user_id}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
};

export async function submitReport(data: FormData) {
  try {
    const response = await fetch(`${API_URL}/reports/create.php`, {
      method: "POST",
      body: data,
      // ❗ Huwag mong lagyan ng 'Content-Type' kapag FormData
    });

    // ⬇️ ILAGAY ITO DITO!
    const text = await response.text(); // kunin ang raw response
    console.log("Raw server response:", text); // 🕵️ TINGNAN MO ITO SA CONSOLE

    // Then parse JSON (kung valid)
    const result = JSON.parse(text);

    if (!response.ok) {
      throw new Error(result.message || "Failed to submit report.");
    }

    return result;
  } catch (error) {
    console.error("submitReport error:", error);
    throw error;
  }
}


