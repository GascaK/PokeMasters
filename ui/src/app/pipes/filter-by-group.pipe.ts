import { Pipe, PipeTransform } from '@angular/core';
import { PokeItemsTemplate } from '../interfaces/pokeItems';

@Pipe({
    name: 'filterByGroup'
})
export class FilterByGroupPipe implements PipeTransform {
    transform(items: PokeItemsTemplate[], groupName: string): PokeItemsTemplate[] {
        if (!items || !groupName) {
            return items;
        }
        return items.filter(item => item.name === groupName);
    }
} 