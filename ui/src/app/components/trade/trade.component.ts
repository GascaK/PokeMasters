import { Component, Input, OnInit } from '@angular/core';

import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { Trades, FullTradeObject } from 'src/app/interfaces/trainer';

import { MenuService } from 'src/app/services/menuService';
import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

// Trade states enum for better type safety
enum TradeState {
  PENDING = 1,
  ACCEPTED = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css']
})
export class TradeComponent implements OnInit {
  @Input() trainerTracker: TrainerTracker;
  @Input() serverService: ServerService;
  @Input() menuService: MenuService;

  public trainer: PokemonMaster;
  public trades: Array<FullTradeObject> = [];
  public yourTrades: Array<FullTradeObject> = [];
  public isLoading: boolean = false;
  public TradeState = TradeState; // Expose enum to template

  // Create trade functionality
  public showCreateTrade: boolean = false;
  public userPokemon: Array<PokemonTemplate> = [];
  public selectedPokemon: PokemonTemplate | null = null;
  public isLoadingUserPokemon: boolean = false;
  public isCreatingTrade: boolean = false;

  // Add-to-trade functionality
  public showAddToTrade: { [tradeId: number]: boolean } = {};
  public addToTradeSelectedPokemon: { [tradeId: number]: PokemonTemplate | null } = {};
  public isAddingToTrade: { [tradeId: number]: boolean } = {};

  async ngOnInit(): Promise<void> {
    await this.initializeTrader();
    await this.loadTrades();
  }

  private async initializeTrader(): Promise<void> {
    try {
      this.trainer = await this.trainerTracker.getTrainer();
    } catch (error) {
      console.error('Failed to load trainer:', error);
      throw error;
    }
  }

  // Helper method to check if trade is active (not completed or cancelled)
  private isTradeActive(trade: FullTradeObject): boolean {
    return trade.state_one !== TradeState.COMPLETED && 
           trade.state_two !== TradeState.COMPLETED &&
           trade.state_one !== TradeState.CANCELLED &&
           trade.state_two !== TradeState.CANCELLED;
  }

  // Only show active (not completed/cancelled) trades for the user
  activeYourTrades(): Array<FullTradeObject> {
    return this.yourTrades.filter(trade => this.isTradeActive(trade));
  }

  private async loadTrades(): Promise<void> {
    this.isLoading = true;
    
    try {
      const trades = await this.serverService.getTrades(this.trainer.id);
      await this.processTrades(trades);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async processTrades(trades: Trades[]): Promise<void> {
    const tradePromises = trades.map(trade => this.processIndividualTrade(trade));
    await Promise.all(tradePromises);
    
    // Filter out completed/cancelled trades after processing
    this.filterActiveTrades();
  }

  private filterActiveTrades(): void {
    this.yourTrades = this.yourTrades.filter(trade => this.isTradeActive(trade));
    this.trades = this.trades.filter(trade => this.isTradeActive(trade));
  }

  private async processIndividualTrade(trade: Trades): Promise<void> {
    try {
      const pkmn_one = trade.id_one === -1 ? null : await this.serverService.getPokemon(trade.id_one);
      const pkmn_two = trade.id_two === -1 ? null : await this.serverService.getPokemon(trade.id_two);

      const fullTradeObject: FullTradeObject = {
        id: trade.id!,
        pkmn_one: pkmn_one,
        pkmn_two: pkmn_two,
        state_one: trade.state_one,
        state_two: trade.state_two
      };

      // Only add active trades
      if (!this.isTradeActive(fullTradeObject)) {
        return; // Skip completed/cancelled trades
      }

      if (this.isUserInvolvedInTrade(pkmn_one, pkmn_two)) {
        this.yourTrades.push(fullTradeObject);
      } else {
        this.trades.push(fullTradeObject);
      }
      
      // Initialize add-to-trade state only for active trades
      this.showAddToTrade[trade.id!] = false;
      this.addToTradeSelectedPokemon[trade.id!] = null;
      this.isAddingToTrade[trade.id!] = false;
    } catch (error) {
      console.error('Failed to process trade:', trade.id, error);
    }
  }

  private isUserInvolvedInTrade(pkmn_one: PokemonTemplate | null, pkmn_two: PokemonTemplate | null): boolean|null {
    return (pkmn_one && pkmn_one.owner === this.trainer.id) || 
           (pkmn_two && pkmn_two.owner === this.trainer.id);
  }

  logs(trade: FullTradeObject): void {
    console.log('Trade details:', trade);
  }

  async updateTrade(trade: FullTradeObject): Promise<void> {
    if (!this.validateTradeUpdate(trade)) {
      return;
    }

    const updatedTrade = this.prepareTradeUpdate(trade);
    try {
      // Call the backend to update the trade state (acceptance)
      await this.serverService.updateTrades(this.trainer.id, updatedTrade);

      // If both sides have accepted, complete the trade in the backend
      if (this.isTradeComplete(updatedTrade)) {
        await this.completeTrade(trade);
      }

      console.log('Trade updated successfully');
    } catch (error) {
      console.error('Failed to update trade:', error);
      this.revertTradeState(trade);
    }
  }

  private validateTradeUpdate(trade: FullTradeObject): boolean {
    if (!trade.pkmn_one || !trade.pkmn_two) {
      console.error('Invalid trade: Missing Pokemon');
      return false;
    }

    const isOwnerOfPokemonOne = trade.pkmn_one.owner === this.trainer.id;
    const isOwnerOfPokemonTwo = trade.pkmn_two.owner === this.trainer.id;

    if (!isOwnerOfPokemonOne && !isOwnerOfPokemonTwo) {
      console.error('Invalid trade: User not involved in trade');
      return false;
    }

    return true;
  }

  private prepareTradeUpdate(trade: FullTradeObject): Trades {
    // Update the appropriate state based on ownership
    if (trade.pkmn_one && trade.pkmn_one.owner === this.trainer.id) {
      if (trade.state_one === TradeState.PENDING) {
        trade.state_one = TradeState.ACCEPTED;
      }
    } else if (trade.pkmn_two && trade.pkmn_two.owner === this.trainer.id) {
      if (trade.state_two === TradeState.PENDING) {
        trade.state_two = TradeState.ACCEPTED;
      }
    }

    return {
      id: trade.id,
      id_one: trade.pkmn_one!.id,
      id_two: trade.pkmn_two!.id,
      state_one: trade.state_one,
      state_two: trade.state_two
    };
  }

  private isTradeComplete(trade: Trades): boolean {
    return trade.state_one === TradeState.ACCEPTED && trade.state_two === TradeState.ACCEPTED;
  }

  private async completeTrade(trade: FullTradeObject): Promise<void> {
    try {
      // Execute the actual Pokemon exchange
      await this.executePokemonExchange(trade);
      
      // Mark trade as completed
      trade.state_one = TradeState.COMPLETED;
      trade.state_two = TradeState.COMPLETED;
      
      const completedTrade: Trades = {
        id: trade.id,
        id_one: trade.pkmn_one!.id,
        id_two: trade.pkmn_two!.id,
        state_one: TradeState.COMPLETED,
        state_two: TradeState.COMPLETED
      };

      await this.serverService.updateTrades(this.trainer.id, completedTrade);
      
      console.log('Trade completed successfully!');
      
      // Remove completed trade from local arrays immediately
      this.yourTrades = this.yourTrades.filter(t => t.id !== trade.id);
      this.trades = this.trades.filter(t => t.id !== trade.id);
      
      // Clean up tracking objects
      delete this.showAddToTrade[trade.id];
      delete this.addToTradeSelectedPokemon[trade.id];
      delete this.isAddingToTrade[trade.id];
      
    } catch (error) {
      console.error('Failed to complete trade:', error);
      throw error;
    }
  }

  private async executePokemonExchange(trade: FullTradeObject): Promise<void> {
    if (!trade.pkmn_one || !trade.pkmn_two) {
      throw new Error('Cannot exchange: Missing Pokemon');
    }

    try {
      // Swap ownership of the Pokemon
      const pokemon1NewOwner = trade.pkmn_two.owner;
      const pokemon2NewOwner = trade.pkmn_one.owner;

      // Update Pokemon ownership on server
      await Promise.all([
        this.serverService.updatePokemonOwner(trade.pkmn_one.id, pokemon1NewOwner),
        this.serverService.updatePokemonOwner(trade.pkmn_two.id, pokemon2NewOwner)
      ]);

      console.log(`Pokemon exchange completed: ${trade.pkmn_one.base.name} ↔ ${trade.pkmn_two.base.name}`);
      
    } catch (error) {
      console.error('Failed to execute Pokemon exchange:', error);
      throw error;
    }
  }

  private revertTradeState(trade: FullTradeObject): void {
    // Revert to previous state if update failed
    if (trade.pkmn_one && trade.pkmn_one.owner === this.trainer.id) {
      if (trade.state_one === TradeState.ACCEPTED) {
        trade.state_one = TradeState.PENDING;
      }
    } else if (trade.pkmn_two && trade.pkmn_two.owner === this.trainer.id) {
      if (trade.state_two === TradeState.ACCEPTED) {
        trade.state_two = TradeState.PENDING;
      }
    }
  }

  async cancelTrade(trade: FullTradeObject): Promise<void> {
    try {
      trade.state_one = TradeState.CANCELLED;
      trade.state_two = TradeState.CANCELLED;

      const cancelledTrade: Trades = {
        id: trade.id,
        id_one: trade.pkmn_one?.id || -1,
        id_two: trade.pkmn_two?.id || -1,
        state_one: TradeState.CANCELLED,
        state_two: TradeState.CANCELLED
      };

      await this.serverService.updateTrades(this.trainer.id, cancelledTrade);
      console.log('Trade cancelled successfully');
      
      // Remove cancelled trade from local arrays immediately
      this.yourTrades = this.yourTrades.filter(t => t.id !== trade.id);
      this.trades = this.trades.filter(t => t.id !== trade.id);
      
      // Clean up tracking objects
      delete this.showAddToTrade[trade.id];
      delete this.addToTradeSelectedPokemon[trade.id];
      delete this.isAddingToTrade[trade.id];
      
    } catch (error) {
      console.error('Failed to cancel trade:', error);
    }
  }

  async refreshTrades(): Promise<void> {
    // Clear all arrays and tracking objects
    this.trades = [];
    this.yourTrades = [];
    this.showAddToTrade = {};
    this.addToTradeSelectedPokemon = {};
    this.isAddingToTrade = {};
    
    await this.loadTrades();
  }

  canAcceptTrade(trade: FullTradeObject): boolean {
    if (!trade.pkmn_one || !trade.pkmn_two) return false;
    if (!this.isTradeActive(trade)) return false; // Don't allow accepting inactive trades
    
    const isOwnerOfPokemonOne = trade.pkmn_one.owner === this.trainer.id;
    const isOwnerOfPokemonTwo = trade.pkmn_two.owner === this.trainer.id;
    
    return (isOwnerOfPokemonOne && trade.state_one === TradeState.PENDING) ||
           (isOwnerOfPokemonTwo && trade.state_two === TradeState.PENDING);
  }

  canAddToTrade(trade: FullTradeObject): boolean {
    // Only allow adding to active trades
    if (!this.isTradeActive(trade)) return false;
    
    // User can add to trade if one side is empty and the user is not already in the trade
    if (!trade.pkmn_one && trade.pkmn_two && trade.pkmn_two.owner !== this.trainer.id) return true;
    if (!trade.pkmn_two && trade.pkmn_one && trade.pkmn_one.owner !== this.trainer.id) return true;
    return false;
  }

  toggleAddToTrade(trade: FullTradeObject): void {
    this.showAddToTrade[trade.id] = !this.showAddToTrade[trade.id];
    if (this.showAddToTrade[trade.id] && this.userPokemon.length === 0) {
      this.loadUserPokemon();
    }
    if (!this.showAddToTrade[trade.id]) {
      this.addToTradeSelectedPokemon[trade.id] = null;
    }
  }

  selectAddToTradePokemon(tradeId: number, pokemon: PokemonTemplate): void {
    if (this.addToTradeSelectedPokemon[tradeId]?.id === pokemon.id) {
      this.addToTradeSelectedPokemon[tradeId] = null;
    } else {
      this.addToTradeSelectedPokemon[tradeId] = pokemon;
    }
  }

  async addPokemonToTrade(trade: FullTradeObject): Promise<void> {
    const selectedPokemon = this.addToTradeSelectedPokemon[trade.id];
    if (!selectedPokemon) {
      console.error('No Pokemon selected to add to trade');
      return;
    }
    this.isAddingToTrade[trade.id] = true;
    try {
      // Determine which side is empty and build the updated trade object
      let updatedTrade: Trades;
      if (!trade.pkmn_one) {
        updatedTrade = {
          id: trade.id,
          id_one: selectedPokemon.id,
          id_two: trade.pkmn_two ? trade.pkmn_two.id : -1,
          state_one: TradeState.PENDING,
          state_two: trade.state_two
        };
      } else if (!trade.pkmn_two) {
        updatedTrade = {
          id: trade.id,
          id_one: trade.pkmn_one.id,
          id_two: selectedPokemon.id,
          state_one: trade.state_one,
          state_two: TradeState.PENDING
        };
      } else {
        throw new Error('Trade is not pending for add');
      }

      // Call the backend to update the trade with the new Pokémon
      await this.serverService.updateTrades(this.trainer.id, updatedTrade);

      console.log('Pokemon added to trade successfully!');
      this.showAddToTrade[trade.id] = false;
      this.addToTradeSelectedPokemon[trade.id] = null;
      await this.refreshTrades();
    } catch (error) {
      console.error('Failed to add Pokemon to trade:', error);
    } finally {
      this.isAddingToTrade[trade.id] = false;
    }
  }

  canCancelTrade(trade: FullTradeObject): boolean {
    return this.isTradeActive(trade); // Only allow cancelling active trades
  }

  getTradeStatus(trade: FullTradeObject): string {
    if (trade.state_one === TradeState.COMPLETED && trade.state_two === TradeState.COMPLETED) {
      return 'Completed';
    }
    if (trade.state_one === TradeState.CANCELLED || trade.state_two === TradeState.CANCELLED) {
      return 'Cancelled';
    }
    if (trade.state_one === TradeState.ACCEPTED && trade.state_two === TradeState.ACCEPTED) {
      return 'Ready to Complete';
    }
    if (trade.state_one === TradeState.ACCEPTED || trade.state_two === TradeState.ACCEPTED) {
      return 'Partially Accepted';
    }
    return 'Pending';
  }

  getCompletedTradesCount(): number {
    // Since we're filtering out completed trades, this will always return 0
    // If you need to track completed trades count, you might want to store it separately
    return 0;
  }

  // Create trade functionality
  toggleCreateTrade(): void {
    this.showCreateTrade = !this.showCreateTrade;
    
    if (this.showCreateTrade && this.userPokemon.length === 0) {
      this.loadUserPokemon();
    }
    
    if (!this.showCreateTrade) {
      this.clearSelection();
    }
  }

  private async loadUserPokemon(): Promise<void> {
    this.isLoadingUserPokemon = true;
    
    try {
      this.userPokemon = await this.serverService.getTrainerPokemon(this.trainer.id);
      console.log('Loaded user Pokemon:', this.userPokemon.length);
    } catch (error) {
      console.error('Failed to load user Pokemon:', error);
      this.userPokemon = [];
    } finally {
      this.isLoadingUserPokemon = false;
    }
  }

  selectPokemon(pokemon: PokemonTemplate): void {
    if (this.selectedPokemon?.id === pokemon.id) {
      this.selectedPokemon = null; // Deselect if already selected
    } else {
      this.selectedPokemon = pokemon;
    }
  }

  clearSelection(): void {
    this.selectedPokemon = null;
  }

  async createTrade(): Promise<void> {
    if (!this.selectedPokemon) {
      console.error('No Pokemon selected for trade');
      return;
    }

    this.isCreatingTrade = true;

    try {

      await this.serverService.startTrade(this.trainer.id, this.selectedPokemon);
      
      console.log('Trade created successfully!');
      
      // Reset create trade UI
      this.showCreateTrade = false;
      this.clearSelection();
      
      // Refresh trades to show the new one
      await this.refreshTrades();
      
    } catch (error) {
      console.error('Failed to create trade:', error);
    } finally {
      this.isCreatingTrade = false;
    }
  }

  exitToMenu(): void {
    this.menuService.setNewView("defaultView");
  }
}