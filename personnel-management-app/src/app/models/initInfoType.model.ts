export class InitInfoType {
  constructor(public id: number, public title: string) {}

  static getList(): InitInfoType[] {
    return [
      { id: InitInfoType.Items.EblaghDakheliAsli, title: 'ابلاغ داخلی اصلی' },
      { id: InitInfoType.Items.MadrakTahsili, title: 'مدرک تحصیلی' },
      { id: InitInfoType.Items.ReshteTahsili, title: 'رشته تحصیلی' },
      { id: InitInfoType.Items.ShahrMahalKhedmat, title: 'شهر محل خدمت' },
      { id: InitInfoType.Items.MojtameGhazaiy, title: 'مجتمع قضائی' },
      { id: InitInfoType.Items.NoeEstekhdam, title: 'نوع استخدام' },
      { id: InitInfoType.Items.Post, title: 'پست' },
      { id: InitInfoType.Items.ReshteShoghli, title: 'رشته شغلی' },
    ];
  }
}

/**
  TypeScript doesn't allow enums to be declared directly inside a class body. We can simulate having an enum "inside" a class
  with a namespace.

  A namespace is a way to logically group related code—like classes, interfaces, functions, and variables—under a
  single name to avoid polluting the global scope and prevent naming conflicts.
 */
export namespace InitInfoType {
  export enum Items {
    EblaghDakheliAsli = 1,
    MadrakTahsili = 2,
    ReshteTahsili = 3,
    ShahrMahalKhedmat = 4,
    MojtameGhazaiy = 5,
    NoeEstekhdam = 6,
    Post = 7,
    ReshteShoghli = 8,
  }
}
