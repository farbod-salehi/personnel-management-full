export class Personnel {
  constructor(
    public firstName: string,
    public codeMeli: string,
    public lastName: string,
    public shomarePersonneli: string,
    public eblaghDakheliAsliId: string | null,
    public sayerSematha: string,
    public vahedKhedmat: string,
    public isSetad: "true" | "false",
    public isMale: "true" | "false",
    public madrakTahsiliId: string | null,
    public reshteTahsiliId: string | null,
    public noeEstekhdamId: string | null,
    public postId: string | null,
    public reshteShoghliId: string | null,
    public mojtameGhazaiyId: string | null,
    public shahrMahalKhedmatId: string | null,
    public tarikhAghazKhedmat: string,
    public noeMahalKhedmat: "0" | "1" | "2"
  ) {}
}
