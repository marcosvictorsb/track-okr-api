export class WebhookEntity {
  public readonly id?: number;
  public readonly source: string;
  public readonly description: string;
  public readonly json: string;
  public readonly status: string;
  public readonly created?: Date;

  constructor(params: {
    id?: number;
    source: string;
    description: string;
    json: string;
    status: string;
    created: Date;
  }) {
    this.id = params.id;
    this.source = params.source;
    this.description = params.description;
    this.json = params.json;
    this.status = params.status;
    this.created = params.created;
  }
}
