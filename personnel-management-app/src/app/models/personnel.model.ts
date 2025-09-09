export class Personnel {
  constructor(
    public firstName: string,
    public codeMeli: string,
    public lastName: string,
    public shomarePersonneli: string,
    public eblaghDakheliAsliId: string,
    public sayerSematha: string,
    public vahedKhedmat: string,
    public isSetad: "true" | "false",
    public isMale: "true" | "false",
    public madrakTahsiliId: string,
    public reshteTahsiliId: string,
    public noeEstekhdamId: string,
    public postId: string,
    public reshteShoghliId: string,
    public mojtameGhazaiyId: string,
    public shahrMahalKhedmatId: string,
    public tarikhAghazKhedmat: string,
    public noeMahalKhedmat: "0" | "1" | "2"
  ) {}

}
