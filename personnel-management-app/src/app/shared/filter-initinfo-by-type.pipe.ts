import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterInitInfoByType' })
export class filterInitInfoByTypePipe implements PipeTransform {
  transform(
    items: { id: string ; title: string; type: number }[],
    type: number
  ): { id: string ; title: string; type: number }[] {
    const result = items?.filter((item) => item.type === type) ?? [];
    return result;
  }
}
