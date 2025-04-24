import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItems'
})
export class FilterItemsPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(item => {
      if (item.isCategoryHeader) {
        // Show category header if any items in the category match
        return true;
      }
      return item.name.toLowerCase().includes(searchText) || 
             item.text.toLowerCase().includes(searchText) ||
             item.category.toLowerCase().includes(searchText);
    });
  }
} 