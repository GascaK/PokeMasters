from server.base import db
from server.models import PokeMoves, PokeItems, PokemonBase, trainers, trainerItems, pokemon
from server.base import create_app

import os
import json

assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server', 'assets')
database_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server', 'database')

if __name__ == "__main__":
    app = create_app()
    app.app_context().push()
    
    data = []
    for file in ['movelist.json', 'pokemonData.json', 'pokemonStarterData.json', 'pokemonItems.json']:
        filepath = os.path.join(assets_dir, file)
        with open(filepath, encoding="utf-8") as file:
            data.append(json.load(file))
    
    if input("Are you sure? This will overwrite ALL your db's. (y/n): ").lower() == 'y':
        # don't do this. lol
        moves = data[0]
        p_base = data[1]
        starters = data[2]
        p_items = data[3]

        count = 0
        tier_count = 0
        for tier in moves:
            tier_count += 1
            for type in moves[tier]:
                for atk in moves[tier][type]:
                    count += 1
                    new_atk = PokeMoves(count, atk['name'], type, atk['special'], tier_count, atk['hit'])
                    print(new_atk)
                    db.session.add(new_atk)

        for id in p_base:
            try:
                num_id = int(id)
            except:
                num_id = '-1'
            new_base_mon = PokemonBase(num_id, 
                                       p_base[id]['name'],
                                       p_base[id]['type'][0],
                                       'normal' if len(p_base[id]['type']) <= 1 else p_base[id]['type'][1],
                                       p_base[id]['hp'],
                                       p_base[id]['tier'],
                                       p_base[id]['speed'])
            print(new_base_mon)
            db.session.add(new_base_mon)

        for id, start in starters.items():
            starter = pokemon(
                99,
                start['name'],
                start['type'][0],
                start['type'][1],
                start['hp'],
                start['tier'],
                start['moves'][0],
                start['moves'][1],
                start['speed']
            )
            print(starter)
            db.session.add(starter)
        
        for item in p_items['items']:
            new_item = PokeItems(
                item['name'],
                item['cost'],
                item['text'],
            )
            print(new_item)
            db.session.add(new_item)

        # trainers
        for each in ['Kevin', 'Kenneth', 'Chris', 'Erick']:
            new_trainer = trainers(each)
            print(new_trainer)
            db.session.add(new_trainer)

        db.session.commit()

        # Starter items.
        for trainer in trainers.query.all():
            for _ in range(3):
                pokeballs = trainerItems("Pokeball", 0, "Add +1 to your next attempt at catching a pokemon.", trainer._id)
                db.session.add(pokeballs)
        db.session.commit()