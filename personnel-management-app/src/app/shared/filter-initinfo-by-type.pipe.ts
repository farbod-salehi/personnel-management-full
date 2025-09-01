import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterInitInfoByType' })
export class filterInitInfoByTypePipe implements PipeTransform {
  transform(
    items: { id: string; title: string; type: number }[],
    type: number,
    model: any,
    propertyName: string
  ): { id: string; title: string; type: number }[] {
    const result = items?.filter((item) => item.type === type) ?? [];
    model[propertyName] = result.length > 0 ? result[0].id : '';
    return result;
  }
}
