const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
console.log("BASE_URL =", BASE_URL);

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
}

class HttpService {
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {}; // SSR safety

    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getHeaders(auth: boolean = true): Record<string, string> {
    if (auth) return this.getAuthHeaders();

    return { "Content-Type": "application/json" };
  }

  private async makeRequest<T = any>(
    endPoint: string,
    method: string,
    body?: any,
    auth: boolean = true,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      if (!BASE_URL) {
        throw new Error("BASE_URL is not defined");
      }

      const url = `${BASE_URL.replace(/\/$/, "")}/${endPoint.replace(/^\//, "")}`;

      const headers = {
        ...this.getHeaders(auth),
        ...options?.headers,
      };

      const config: RequestInit = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(url, config);

      // ✅ SAFE JSON PARSE
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // ✅ BETTER ERROR HANDLING
      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }
      return data;
    } catch (error: any) {
      console.error(`Api Error [${method} ${endPoint}]:`, error.message);
      throw error;
    }
  }

  // ✅ WITH AUTH
  async getWithAuth<T = any>(
    endPoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "GET", undefined, true, options);
  }

  async postWithAuth<T = any>(
    endPoint: string,
    body: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "POST", body, true, options);
  }

  async putWithAuth<T = any>(
    endPoint: string,
    body: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "PUT", body, true, options);
  }

  async deleteWithAuth<T = any>(
    endPoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "DELETE", undefined, true, options);
  }

  // ❌ WITHOUT AUTH
  async getWithoutAuth<T = any>(
    endPoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "GET", undefined, false, options);
  }

  async postWithoutAuth<T = any>(
    endPoint: string,
    body: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "POST", body, false, options);
  }
}

// ✅ Singleton
export const httpService = new HttpService();

// ✅ Bind methods
export const getWithAuth = httpService.getWithAuth.bind(httpService);
export const postWithAuth = httpService.postWithAuth.bind(httpService);
export const putWithAuth = httpService.putWithAuth.bind(httpService);
export const deleteWithAuth = httpService.deleteWithAuth.bind(httpService);

export const postWithoutAuth = httpService.postWithoutAuth.bind(httpService);
export const getWithoutAuth = httpService.getWithoutAuth.bind(httpService);