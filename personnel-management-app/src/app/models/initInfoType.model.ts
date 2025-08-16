export class InitInfoType {
  constructor(
    public id: number,
    public title: string,
  ){}

  static getList(): InitInfoType[] {
    return [
      {id:1, title: "ابلاغ داخلی اصلی"},
      {id:2, title: "مدرک تحصیلی"},
      {id:3, title: "رشته تحصیلی"},
      {id:4, title: "شهر محل خدمت"},
      {id:5, title: "مجتمع قضائی"},
      {id:6, title: "نوع استخدام"},
      {id:7, title: "پست"},
      {id:8, title: "رشته شغلی"},
    ];
  }
}
