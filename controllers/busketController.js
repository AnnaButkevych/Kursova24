const { runDBCommand } = require("../db/connection");
const busketController = {

    async add(req, res) {
        const { productId } = req.params;
    
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
    
        try {
            const session_id = req.session.sessionId;
            console.log("Session ID:", session_id);
            console.log("Product ID:", productId);
    
            const query = `INSERT INTO Busket (Session_id, Order_Water_id, IsProcessed) 
                           VALUES ('${session_id}', '${productId}', false)`;
    
            await runDBCommand(query);
    
            res.status(201).json({ message: 'Товар додано в кошик' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Сталася помилка при додаванні в кошик', error });
        }
    },

  // Get a specific busket item by session_id
    async getBysession(req, res) {
    try {
      const { sessionId } = req.params;
      const busketItems = await Busket.findAll({ where: { session_id: sessionId } });
      if (!busketItems) {
        return res.status(404).json({ message: 'Busket items not found for this session' });
      }
      res.status(200).json(busketItems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching busket items', error });
    }
  },

  // Update an existing busket item
  async update(req, res) {
    try {
      const { id } = req.params;
      const { IsProcessed } = req.body;

      const busketItem = await Busket.findByPk(id);
      if (!busketItem) {
        return res.status(404).json({ message: 'Busket item not found' });
      }

      busketItem.IsProcessed = IsProcessed;
      await busketItem.save();

      res.status(200).json(busketItem);
    } catch (error) {
      res.status(500).json({ message: 'Error updating busket item', error });
    }
  },

  // Delete a busket item
  async delete(req, res) {
    try {
      const { id } = req.params;
      const busketItem = await Busket.findByPk(id);
      if (!busketItem) {
        return res.status(404).json({ message: 'Busket item not found' });
      }

      await busketItem.destroy();
      res.status(200).json({ message: 'Busket item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting busket item', error });
    }
  }
};

module.exports = busketController;
