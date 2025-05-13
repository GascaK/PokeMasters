import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { MenuService } from 'src/app/services/menuService';
import ServerService from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';


interface GroupedItems {
  name: string;
  items: PokeItemsTemplate[];
  count: number;
}

interface CartItem {
  item: PokeItemsTemplate;
  quantity: number;
  availableStock: number;
  purchasedItems: PokeItemsTemplate[]; // Track specific items to purchase
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  @Input() trainerTracker: TrainerTracker;
  @Input() serverService: ServerService;
  @Input() menuService: MenuService;
  public audio = new Audio();

  public trainer: PokemonMaster;
  public shop: Array<PokeItemsTemplate>;
  public groupedShop: GroupedItems[] = [];
  public cart: CartItem[] = [];
  public cartTotal: number = 0;
  public activeTab: string = 'balls'; // Initialize with balls tab active
  public isPurchasing: boolean = false;

  async ngOnInit() {
    const sources = ["assets/sounds/pokemon_center_0.webm", "assets/sounds/pokemon_center_1.webm"];
    const ind: number = Math.floor(Math.random() * sources.length);

    this.audio.src = sources[ind];
    this.audio.load();
    this.audio.volume = 0.2;
    this.audio.loop = true;
    this.audio.play();

    if (this.trainerTracker?.isLoggedIn()) {
      this.trainer = await this.trainerTracker.getTrainer();
      this.getNewShop(this.trainer.getCurrentTier() * 2);
    }
  }

  ngOnDestroy(): void {
    // Clean up animations when component is destroyed
      this.audio.pause();
  }

  async getNewShop(shelfSpace: number): Promise<void> {
    try {
      const shopItems = await this.serverService.getItemsShop(
        this.trainer.id,
        this.trainer.getCurrentTier(),
        shelfSpace * (this.trainer.getCurrentTier() + 1) // Increase items based on tier
      );

      this.shop = shopItems.sort((a, b) => a.cost - b.cost);
      this.groupItemsByName();
    } catch (error) {
      console.error('Error loading shop items:', error);
    }
  }

  groupItemsByName(): void {
    // Create a map to group items by name
    const groupMap = new Map<string, PokeItemsTemplate[]>();

    // Group items by their name
    this.shop.forEach(item => {
      if (!groupMap.has(item.name)) {
        groupMap.set(item.name, []);
      }
      groupMap.get(item.name)!.push(item);
    });

    // Convert map to array of GroupedItems with count
    this.groupedShop = Array.from(groupMap.entries()).map(([name, items]) => ({
      name,
      items: items, // Show all items in the group
      count: items.length // Keep track of total items in group
    }));

    // Sort groups by Ball type first, then by price
    this.groupedShop.sort((a, b) => {
      // Check if either item is a Ball
      const aIsBall = a.name.toLowerCase().includes('ball');
      const bIsBall = b.name.toLowerCase().includes('ball');

      // If one is a Ball and the other isn't, sort the Ball first
      if (aIsBall !== bIsBall) {
        return aIsBall ? -1 : 1;
      }

      // If both are Balls or both are not Balls, sort by price
      const priceCompare = a.items[0].cost - b.items[0].cost;
      if (priceCompare !== 0) {
        return priceCompare;
      }

      // If prices are equal, sort by name
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Check if the trainer can afford the item
   */
  canAffordItem(item: PokeItemsTemplate): boolean {
    return this.trainer && this.trainer.dollars >= item.cost;
  }

  /**
   * Purchase an item and update trainer's dollars
   */
  async purchaseItem(item: PokeItemsTemplate): Promise<void> {
    try {
      const result = await this.trainer.buyItem(item);
      console.log(result);

      // Update trainer data to reflect new balance
      this.updateTrainerBalance();

      // Remove item from shop array
      const index = this.shop.indexOf(item);
      if (index > -1) {
        this.shop.splice(index, 1);
      }

      // Regroup items after purchase
      this.groupItemsByName();
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert((error as Error).message);
    }
  }

  /**
   * Refresh trainer data to get updated dollars/balance
   */
  async updateTrainerBalance(): Promise<void> {
    try {
      // Fetch the latest trainer data to get updated balance
      this.trainer = await this.trainerTracker.getTrainer();
    } catch (error) {
      console.error('Error updating trainer balance:', error);
    }
  }

  returnView() {
    this.menuService.setNewView("defaultView");
  }

  /**
   * Add item to cart
   */
  addToCart(group: GroupedItems): void {
    if (!group || group.items.length === 0) return;

    const item = group.items[0]; // Get the first item from the group
    const availableStock = group.count;
    const existingItem = this.cart.find(cartItem => cartItem.item.id === item.id);

    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        existingItem.quantity = availableStock; // Set quantity to group count
        // Add all items from the group
        existingItem.purchasedItems = [...group.items];
      } else {
        alert(`Only ${availableStock} ${item.name} available in stock!`);
      }
    } else {
      this.cart.push({
        item,
        quantity: availableStock, // Set quantity to group count
        availableStock: availableStock,
        purchasedItems: [...group.items] // Add all items from the group
      });
    }

    this.updateCartTotal();
  }

  /**
   * Remove item from cart
   */
  removeFromCart(item: PokeItemsTemplate): void {
    const index = this.cart.findIndex(cartItem => cartItem.item.id === item.id);
    if (index !== -1) {
      this.cart.splice(index, 1);
      this.updateCartTotal();
    }
  }

  /**
   * Update item quantity in cart
   */
  updateCartQuantity(cartItem: CartItem, quantity: number): void {
    // Find the group that contains this exact item
    const group = this.groupedShop.find(g =>
      g.items.some(i => i.id === cartItem.item.id)
    );
    if (!group) return;

    if (quantity > group.count) {
      alert(`Only ${group.count} ${cartItem.item.name} available in stock!`);
      quantity = group.count;
    }

    // Update purchased items array
    if (quantity > cartItem.quantity) {
      // Add more items
      const itemsToAdd = this.shop
        .filter(i => i.id === cartItem.item.id)
        .slice(0, quantity - cartItem.quantity);
      cartItem.purchasedItems.push(...itemsToAdd);
    } else if (quantity < cartItem.quantity) {
      // Remove items from the end
      cartItem.purchasedItems = cartItem.purchasedItems.slice(0, quantity);
    }

    cartItem.quantity = Math.max(0, quantity);
    if (cartItem.quantity === 0) {
      this.removeFromCart(cartItem.item);
    }
    this.updateCartTotal();
  }

  /**
   * Calculate cart total
   */
  updateCartTotal(): void {
    this.cartTotal = this.cart.reduce((total, cartItem) => {
      return total + (cartItem.item.cost * cartItem.quantity);
    }, 0);
  }

  /**
   * Check if trainer can afford cart total
   */
  canAffordCart(): boolean {
    return this.trainer && this.trainer.dollars >= this.cartTotal;
  }

  /**
   * Update shop arrays after item removal
   */
  private updateShopAfterPurchase(itemId: number): void {
    // Find the exact item by ID in the shop array
    const shopIndex = this.shop.findIndex(shopItem => shopItem.id === itemId);
    if (shopIndex !== -1) {
      // Remove the specific item from the shop
      this.shop.splice(shopIndex, 1);

      // Find the group that contains this item
      const groupIndex = this.groupedShop.findIndex(group =>
        group.items.some(groupItem => groupItem.id === itemId)
      );

      if (groupIndex !== -1) {
        const group = this.groupedShop[groupIndex];
        // Find and remove the specific item from the group
        const itemIndex = group.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          group.items.splice(itemIndex, 1);
        }
        // Decrease the count
        group.count--;

        // If no more items in the group, remove the group
        if (group.count <= 0) {
          this.groupedShop.splice(groupIndex, 1);
        }
      }
    }
  }

  /**
   * Update cart item's available stock
   */
  private updateCartItemStock(cartItem: CartItem): void {
    const group = this.groupedShop.find(g => g.items.some(i => i.id === cartItem.item.id));
    if (group) {
      cartItem.availableStock = group.count;
      // If current quantity exceeds new available stock, adjust it
      if (cartItem.quantity > cartItem.availableStock) {
        cartItem.quantity = cartItem.availableStock;
      }
    } else {
      // Item no longer available in shop, remove from cart
      this.removeFromCart(cartItem.item);
    }
  }

  /**
   * Update all cart items' available stock
   */
  private updateAllCartStock(): void {
    // Create a copy of cart items to avoid modification during iteration
    const cartItems = [...this.cart];
    cartItems.forEach(cartItem => {
      this.updateCartItemStock(cartItem);
    });
    this.updateCartTotal();
  }

  /**
   * Process checkout and purchase all items in cart
   */
  async checkout(): Promise<void> {
    if (!this.canAffordCart()) {
      return;
    }

    this.isPurchasing = true;

    try {
      // Process each item in cart
      for (const cartItem of this.cart) {
        // Get the actual specific items from the group in the shop
        const itemGroup = this.groupedShop.find(group =>
          group.name === cartItem.item.name
        );

        if (!itemGroup || itemGroup.count < cartItem.quantity) {
          throw new Error(`Not enough ${cartItem.item.name} in stock`);
        }

        // Take the specific items from the group that we want to purchase
        const itemsToPurchase = itemGroup.items.slice(0, cartItem.quantity);

        // Purchase each specific item
        for (const itemToPurchase of itemsToPurchase) {
          await this.trainer.buyItem(itemToPurchase);

          // Remove the specific item from shop
          const shopIndex = this.shop.findIndex(shopItem => shopItem.id === itemToPurchase.id);
          if (shopIndex !== -1) {
            this.shop.splice(shopIndex, 1);
          }

          // Remove from group items array
          const itemIndex = itemGroup.items.findIndex(item => item.id === itemToPurchase.id);
          if (itemIndex !== -1) {
            itemGroup.items.splice(itemIndex, 1);
          }

          // Update group count
          itemGroup.count--;
        }
      }

      // Update trainer data
      await this.updateTrainerBalance();

      // Clean up empty groups
      this.groupedShop = this.groupedShop.filter(group => group.count > 0);

      // Reset cart
      this.cart = [];
      this.cartTotal = 0;

    } catch (error) {
      console.error('Error during checkout:', error);
      // Regroup items to reflect current state after partial checkout
      this.groupItemsByName();
      // Update cart stock information
      this.updateAllCartStock();
    } finally {
      this.isPurchasing = false;
    }
  }

}
