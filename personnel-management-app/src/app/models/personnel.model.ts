export class Personnel {
  constructor(
    public firstName: string,
    public codeMeli: string,
    public lastName: string,
    public shomarePersonneli: string,
    public eblaghDakheliAsliId: string | undefined,
    public sayerSematha: string,
    public vahedKhedmat: string,
    public isSetad: string,
    public isMale: string,
    public madrakTahsiliId: string | undefined,
    public reshteTahsiliId: string | undefined,
    public noeEstekhdamId: string | undefined,
    public postId: string | undefined,
    public reshteShoghliId: string | undefined,
    public mojtameGhazaiyId: string | undefined,
    public shahrMahalKhedmatId: string | undefined,
    public tarikhAghazKhedmat: string,
    public noeMahalKhedmat: string
  ) {}
}
