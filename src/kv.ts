export class KVManager<T> {
  constructor(private prefix: string, private id: string) {}

  get fullId() {
    return this.prefix + this.id;
  }

  async getJSON() {
    return await WEBHOOKS_INFO.get<T>(this.fullId, 'json');
  }

  async setJSON(data: T) {
    return await WEBHOOKS_INFO.put(this.fullId, JSON.stringify(data));
  }

  async updateJSON(data: Partial<T>) {
    const oldData = (await this.getJSON()) ?? {};
    const newData = Object.assign({}, oldData, data);
    return await WEBHOOKS_INFO.put(this.fullId, JSON.stringify(newData));
  }
}
