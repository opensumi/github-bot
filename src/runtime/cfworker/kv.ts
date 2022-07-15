export class KVManager2<T> {
  constructor(private kv: KVNamespace, private prefix: string = '') {}

  f(key: string) {
    return this.prefix + key;
  }

  async getJSON(key: string) {
    return await this.kv.get<T>(this.f(key), 'json');
  }

  async setJSON(key: string, data: T) {
    return await this.kv.put(this.f(key), JSON.stringify(data));
  }

  async updateJSON(key: string, data: Partial<T>) {
    const oldData = (await this.getJSON(key)) ?? {};
    const newData = Object.assign({}, oldData, data);
    return await this.kv.put(this.f(key), JSON.stringify(newData));
  }
}
