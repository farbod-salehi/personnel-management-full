export class AuthInfo {
  constructor(
    public title: string = "",
    public token: string = "",
    public role: number = 0
  ) {}

  userIsAdmin() : boolean {
    return this.role === 1;
  }
}
