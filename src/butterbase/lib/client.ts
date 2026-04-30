export const butterbaseConfig = {
  appId: import.meta.env.VITE_BUTTERBASE_APP_ID || '',
  baseUrl: import.meta.env.VITE_BUTTERBASE_API_BASE_URL || 'https://api.butterbase.com',
  connectionMode: 'REST' // switchable between REST and Sockets
};

export interface ButterbaseRecord {
  id: string;
  createdAt: string;
  [key: string]: any;
}

class ButterbaseClient {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-bb-app-id': butterbaseConfig.appId,
      'Authorization': `Bearer ${localStorage.getItem('bb_token') || ''}`
    };
  }

  async login(email: string, pass: string) {
    if (butterbaseConfig.connectionMode === 'REST') {
      const res = await fetch(`${butterbaseConfig.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, pass })
      });
      if (!res.ok) throw new Error('Auth failed');
      const data = await res.json();
      localStorage.setItem('bb_token', data.token);
      return data;
    }
    throw new Error('Sockets mode not fully implemented');
  }

  async fetchRecords(table: string): Promise<ButterbaseRecord[]> {
    const res = await fetch(`${butterbaseConfig.baseUrl}/data/${table}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  }

  async createRecord(table: string, data: any) {
    const res = await fetch(`${butterbaseConfig.baseUrl}/data/${table}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Create failed');
    return res.json();
  }

  async deleteRecord(table: string, id: string) {
    const res = await fetch(`${butterbaseConfig.baseUrl}/data/${table}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${butterbaseConfig.baseUrl}/storage/upload`, {
      method: 'POST',
      headers: {
        'x-bb-app-id': butterbaseConfig.appId,
        'Authorization': `Bearer ${localStorage.getItem('bb_token') || ''}`
      },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }
}

export const bbClient = new ButterbaseClient();
