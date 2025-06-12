import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import foxImage from '../../assets/img/foxbot.png'; // Adjust path if needed





const farmingKeywords = [
  'agriculture', 'farming', 'crops', 'harvest', 'soil', 'irrigation', 'fertilizer', 'pesticides', 'organic farming',
  'wheat', 'corn', 'rice', 'tomato', 'potato', 'onions', 'strawberries', 'apples', 'climate change', 'drought',
  'livestock', 'dairy farming', 'poultry', 'pest control', 'drip irrigation', 'hydroponics', 'greenhouse', 'tractor'
];

const cities = [
  { label: 'Kochi', value: 'Kochi' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'New York', value: 'New York' },
  { label: 'Tokyo', value: 'Tokyo' }
];

const farmingKeywordsReplies = {
  "irrigation": "Oh, irrigation? It's like giving your plants a drink when the rain isn't enough. You can either use sprinklers, which just spray the water around, or drip irrigation, which delivers water directly to the roots – super efficient!",
  "Agriculture": "Agriculture is the backbone of food production worldwide. It involves cultivating soil, growing crops, and raising animals for food, fiber, and other products. Let me know if you need specific farming tips for a particular crop or region!",
  "best crops for summer":"In summer, the best crops to grow depend on the climate and region, but generally, heat-resistant and drought-tolerant crops thrive. Farmers and gardeners should focus on plants that can withstand high temperatures and require minimal water. Here are some top choices: 🌿 Vegetables - Tomatoes grow well in warm weather with plenty of sunlight, making them an excellent summer crop. Bell peppers and chilies require hot temperatures to develop their full flavor. Cucumbers are fast-growing and ideal for fresh summer salads. Okra (Lady’s Finger) thrives in high heat and can grow even with low water availability. Eggplant (Brinjal) prefers warm soil and flourishes in summer conditions. Pumpkin and squash are heat-tolerant and great choices for summer gardening due to their resilience. 🌾 Grains & Pulses - Maize (Corn) requires warm temperatures and full sunlight to grow effectively. Millets (Bajra, Jowar, Ragi) are highly drought-resistant and perfect for hot, dry climates. Soybeans are another heat-tolerant option, providing high nutritional value while growing well in summer conditions. 🍉 Fruits - Watermelon and muskmelon thrive in extreme heat and require minimal care, making them perfect summer fruits. Mangoes, known as the king of summer fruits, grow best in tropical climates with plenty of sunshine. Papaya is another excellent summer crop, growing quickly and flourishing in warm conditions.  🌿 Herbs - Basil loves warm temperatures and grows well in pots, making it a great herb for home gardens. Lemongrass is highly drought-resistant and perfect for making refreshing summer drinks. Mint, although it requires some moisture, still thrives in warm weather and can be a great addition to any summer herb garden. Would you like recommendations based on a specific region or farming conditions? ",
  "Crops": "Crops are plants grown for food, fiber, or other agricultural products. Common crops include wheat, corn, rice, and soybeans. Would you like to know more about growing a specific crop or its care?",
  "Harvest": "Harvesting is the process of collecting mature crops from the fields. The timing of harvest is crucial to ensure the best yield. If you're unsure when to harvest your crops, I can help with some timing tips!",
  "Soil": "Soil health is vital for healthy crop growth. It needs to be rich in nutrients and well-drained to support plant roots. Would you like advice on soil testing or how to improve soil quality?",
  "Irrigation": "Irrigation is the artificial application of water to soil to help crops grow. Different methods like drip irrigation, sprinklers, or flood irrigation can be used depending on the crop and terrain. Are you interested in setting up an irrigation system?",
  "Organic farming": "Organic farming focuses on using natural processes and materials to grow crops. It avoids synthetic pesticides and fertilizers, promoting biodiversity. I can help you understand how to start or improve your organic farming methods!",
  "Pesticides": "Pesticides are chemicals used to control pests and diseases in crops. While they can be effective, overuse can harm the environment. Interested in learning about organic alternatives to pesticides?",
  "Crop rotation": "Crop rotation is the practice of changing the type of crop grown in a field each season. This helps maintain soil fertility and reduce the risk of pests and diseases. Let me know if you'd like advice on which crops to rotate!",
  "Sustainable farming": "Sustainable farming aims to produce food in a way that is environmentally friendly, economically viable, and socially responsible. It involves methods like reduced pesticide use, efficient water management, and preserving biodiversity. How can I assist you with sustainable farming practices?",
  "Livestock": "Livestock farming includes raising animals for food, fiber, and labor. Common livestock include cattle, pigs, sheep, and poultry. Are you looking for tips on raising any specific type of livestock?",
  "Dairy farming": "Dairy farming involves the production of milk from cows, goats, or other animals. It requires careful attention to animal health, nutrition, and milking schedules. Would you like some tips on improving milk yield or caring for dairy animals?",
  "Poultry farming": "Poultry farming is the practice of raising chickens, turkeys, or ducks for eggs and meat. Good poultry management involves proper housing, feeding, and disease prevention. Need advice on setting up a poultry farm?",
  "Crop diseases": "Crop diseases can have a significant impact on harvest yields. Common diseases like blight or mildew can be controlled with early intervention. I can help you identify potential crop diseases and suggest treatment methods!",
  "Pest control": "Pest control is essential for preventing damage to crops from insects, rodents, and other pests. Integrated pest management (IPM) combines biological, cultural, and chemical methods. Want to know how to keep pests under control on your farm?",
  "Fertilizers": "Fertilizers provide essential nutrients to crops, promoting growth and increasing yield. There are both synthetic and organic fertilizers available. If you need help choosing the right fertilizer for your crops, let me know!",
  "Greenhouse farming": "Greenhouse farming allows you to grow crops in a controlled environment, extending the growing season and protecting plants from extreme weather. Do you need advice on setting up or managing a greenhouse?",
  "Aquaponics": "Aquaponics is a farming system that combines aquaculture (fish farming) with hydroponics (growing plants in water). The fish waste provides nutrients for the plants, and the plants help filter the water for the fish. Would you like to know more about setting up an aquaponic system?",
  "Climate change": "Climate change is having a growing impact on farming, affecting weather patterns, water availability, and crop yields. Farmers are adapting by using more resilient farming practices. Interested in learning how climate change might affect your farming area?",
  "Crop pests": "Crop pests can damage plants and reduce yields. Common pests include aphids, caterpillars, and beetles. I can help you identify pests and suggest solutions for controlling them naturally or with minimal harm to the environment.",
  "Hello": "Hi there! How can I assist you today? Feel free to ask anything about farming, crops, or anything else on your mind!",
  "Hey": "Hello! How can I help you today? Ask me anything about farming, weather, crops, or even tips for your plants!",
  "How are you": "I'm doing great, thank you for asking! How can I assist you with your farming needs today?",
  "Good morning": "Good morning! How can I help you today? If you're looking for farming tips or weather updates, I'm here for you!",
  "Good evening": "Good evening! If you need any help with farming or weather-related questions, feel free to ask!",
  "Goodbye": "Goodbye! It was a pleasure assisting you. Feel free to reach out whenever you need help. Have a great day!",
  "Thank you": "You’re welcome! If you have more questions, I’m always here to help. Just ask away!",
  "Please": "sure! Tell me how else can I assist you?",
  "What is your name": "I’m your friendly farming assistant! How can I help you with farming or weather today?",
  "Can you help me": "Of course! What do you need help with? Whether it’s crop information, farming techniques, or even weather forecasts, I’m here for you.",
  "What do you do": "I assist you with all things farming! Whether it's growing crops, managing livestock, or providing weather information, I can help. Just ask away!",
  "How do I plant [crop]?": (crop) => `To plant ${crop}, start by preparing the soil, adding necessary fertilizers, and planting seeds at the recommended depth. Let me know if you want step-by-step guidance!`,
  "What is [keyword]?": (keyword) => `${keyword} refers to [provide explanation]. Do you need more details or tips related to this topic?`,
  "What should I do for my plants in winter?": "In winter, some plants require extra protection, such as covering them or bringing them indoors. Other plants might go dormant. I can suggest specific tips for the plants you have.",
  "Help": "I’m here to help! How can I assist you today? Whether it’s farming tips, pest control, or weather updates, just let me know.",
  "Where are you located?": "I'm not tied to a location—I can help farmers worldwide! Just tell me your location or farm needs, and I’ll assist you.",
  "I’m bored": "I understand! How about learning something new about farming? I can tell you about sustainable practices, innovative technologies, or new crops to try!",
  "What is the weather like in [city]?": (city) => `Let me check the weather for ${city}. I’ll get the latest temperature, humidity, and forecasts for you!`,
  "How is the weather today?": "I can give you a weather update for your area! Just let me know your city, and I'll fetch the data for you.",
  "Do you like farming": "I don't have feelings, but I do think farming is essential for feeding the world. Let me know if you’d like to know more about farming techniques!",
  "What is hydroponics": "Hydroponics is a method of growing plants without soil. Instead, plants are grown in water with added nutrients. It's great for areas with poor soil quality. Interested in learning how to start a hydroponic system?",
  "What is aquaponics": "Aquaponics combines fish farming with hydroponics. The fish waste provides nutrients for the plants, and the plants filter the water for the fish. Want to know how to set up an aquaponic system?",
  "Soil erosion": "Soil erosion happens when wind or water removes the topsoil, which is vital for plant growth. Implementing cover crops, mulching, and contour farming can reduce erosion. Need help with anti-erosion techniques?",
  "Composting": "Composting turns organic waste into nutrient-rich soil. It improves soil health, retains moisture, and reduces the need for chemical fertilizers. Would you like to learn how to create your own composting system?",
  "What is organic farming?": "Organic farming avoids synthetic pesticides and fertilizers. It uses natural processes to grow crops and raise livestock. If you're interested in starting organic farming, I can guide you through the steps!",
  "What is the best time to plant [crop]?": (crop) => `The best planting time for ${crop} depends on your location's weather and soil conditions. Let me know where you're located, and I can help you determine the optimal planting time!`,
  "What is crop rotation?": "Crop rotation involves changing the type of crop grown in a field each season. This helps maintain soil health and reduces the risk of pests and diseases. Need advice on which crops to rotate?",
  "Mulching": "Mulching involves placing a layer of material like straw or leaves over the soil to retain moisture, suppress weeds, and regulate temperature. Would you like tips on what materials to use for mulching?",
  "What is agroforestry?": "Agroforestry integrates trees and shrubs into agricultural systems, improving biodiversity, soil fertility, and water management. It's an effective practice for sustainable farming. Want to know more about how to implement it?",
  "How do I prevent pests on my crops?": "Preventing pests starts with healthy soil, crop rotation, and using natural pest control methods. I can help you with pest management options suited to your crops.",
  "How do I protect my crops from frost?": "To protect crops from frost, cover them with cloth or plastic, or use a greenhouse or cold frame. You can also plant frost-resistant varieties. Let me know which crops you're growing, and I can provide more details!",
  "Planting seeds": "Planting seeds requires careful consideration of soil health and weather conditions. Always plant at the right depth and water after sowing. Would you like tips on which seeds are best for your area?",
  "Watering crops": "Proper watering is essential for plant growth. Overwatering or underwatering can harm your crops. Different plants have varying water needs. Need advice on irrigation systems or watering schedules?",
  "Farming equipment": "Farming equipment includes tools and machinery that assist with planting, cultivating, and harvesting crops. From tractors to seeders, choosing the right equipment can save time and improve efficiency. Interested in learning more about specific farming tools?",
  "Compost": "Composting is a great way to recycle organic matter and enrich the soil. It improves soil texture, adds essential nutrients, and helps retain moisture. Do you want advice on how to make your own compost?",
  "Green manure": "Green manure involves planting cover crops and then plowing them into the soil to improve its fertility. It helps prevent soil erosion and promotes better plant health. Would you like to know which crops work best for green manure?",
  "Farming methods": "Farming methods vary from conventional to sustainable, each with its own approach to crop and livestock care. Would you like to explore modern farming methods or traditional practices?",
  
  "Climate-smart agriculture": "Climate-smart agriculture focuses on adapting farming practices to changing climate conditions. It includes sustainable methods to increase productivity while reducing emissions. Would you like to learn more about these practices?",
  "Agroforestry": "Agroforestry integrates trees and shrubs into agricultural systems to improve biodiversity, reduce soil erosion, and increase carbon sequestration. Are you interested in incorporating trees into your farm?",
  "Cover crops": "Cover crops are planted to improve soil health and prevent erosion. They help fix nitrogen in the soil and provide habitat for beneficial insects. Would you like to know which cover crops are best for your soil?",
  "Pollination": "Pollination is essential for the production of many crops, especially fruits and vegetables. Bees, butterflies, and other insects play a key role. Need advice on attracting pollinators to your farm?",
  "Soil testing": "Soil testing is crucial for understanding the nutrient levels and pH of your soil. It helps you determine which fertilizers to use and how to improve soil quality. Would you like to know how to conduct a soil test?",
  "Weed control": "Weed control is important to prevent unwanted plants from competing with your crops for nutrients and water. There are both chemical and natural ways to manage weeds. Would you like tips on organic weed control?",
  "Farm management": "Farm management involves the planning and organizing of all activities on a farm, from planting to harvesting and marketing produce. Would you like advice on improving your farm's management practices?",
  "Precision farming": "Precision farming uses technology, such as GPS and sensors, to monitor and optimize field-level management. It increases efficiency and reduces waste. Interested in exploring precision farming tools for your crops?",
  "Biosecurity": "Biosecurity involves practices to prevent the spread of pests, diseases, and contaminants on your farm. This includes quarantine measures and proper sanitation. Would you like to learn more about biosecurity practices for livestock or crops?",
  "Farm-to-table": "Farm-to-table refers to the process of growing, harvesting, and selling food directly to consumers, minimizing the distance food travels. Are you looking to set up your own farm-to-table operation?",
  "Urban farming": "Urban farming involves growing crops and raising animals in urban areas, using methods like rooftop gardens and vertical farming. Would you like to know how to start an urban farm?",
  "Hydroponics": "Hydroponics is a method of growing plants without soil, using nutrient-rich water. It’s great for indoor farming and can save space. Are you interested in setting up a hydroponic system?",
  "Permaculture": "Permaculture is a sustainable farming method that designs agricultural systems based on natural ecosystems. It emphasizes resource efficiency and biodiversity. Would you like to learn how to design a permaculture garden?",
  "Agri-business": "Agri-business refers to the business side of farming, including the production, processing, and marketing of agricultural products. Do you need tips on starting or managing an agri-business?",
  "Farm insurance": "Farm insurance protects your crops, livestock, and equipment from damage or loss. It’s important to ensure your farm is covered against potential risks. Would you like help understanding the types of farm insurance?",
  "Livestock breeding": "Livestock breeding involves selecting animals for reproduction to improve desirable traits like size, milk yield, or disease resistance. Do you need tips on breeding specific livestock?",
  "Aquaculture": "Aquaculture is the farming of fish, shellfish, and other aquatic organisms. It’s a growing industry for sustainable food production. Are you interested in starting an aquaculture farm?",
  "Agri-tech": "Agri-tech refers to the use of technology and innovation in agriculture to improve efficiency, reduce costs, and boost productivity. Interested in learning about the latest agri-tech tools and apps?",
  "Greenhouses": "Greenhouses are controlled environments used to grow plants year-round, protecting crops from harsh weather. Would you like advice on setting up a greenhouse for your farm?",
  "Farm animals": "Farm animals, like cows, chickens, and pigs, are raised for meat, dairy, and other products. Do you need help with caring for specific farm animals or improving their productivity?",
  "Farming subsidies": "Farming subsidies are financial assistance provided by governments to support farmers. They can help offset losses or promote certain agricultural practices. Would you like to know more about available subsidies?",
  "Agrochemical use": "Agrochemicals, including pesticides, herbicides, and fertilizers, help increase crop yields but must be used carefully to avoid environmental harm. Want advice on safe agrochemical use?",
  "Sustainable practices": "Sustainable farming practices focus on maintaining the land’s fertility, protecting the environment, and ensuring food security for future generations. Interested in learning more about sustainable farming techniques?",
  "Farm automation": "Farm automation involves using machinery and robots to perform tasks like planting, irrigation, and harvesting, which improves efficiency. Would you like to know about the latest automation tools for farming?",
  "Hydrological cycles": "Hydrological cycles describe the movement of water through the earth, impacting rainfall and irrigation. Understanding water cycles is essential for successful farming. Want to know how water cycles affect your crops?",
  "Agroecology": "Agroecology is a science that applies ecological principles to farming, emphasizing sustainability, biodiversity, and resilience. Are you interested in agroecological farming techniques?",
  "Soil conservation": "Soil conservation involves methods to prevent soil erosion and degradation. Techniques like no-till farming and terracing are commonly used. Would you like tips on soil conservation for your farm?",
  
  "Grazing management": "Grazing management involves controlling the way livestock graze on pastures to prevent overgrazing and improve forage quality. Need tips on managing grazing for better pasture health?",
  "Crop breeding": "Crop breeding is the science of improving crop varieties for better yield, disease resistance, or quality. Would you like to learn more about the process of breeding crops?",
  "Agro-tourism": "Agro-tourism involves inviting visitors to farms to experience agricultural activities, promoting both farming and tourism. Would you like ideas on how to start an agro-tourism venture on your farm?",
  "Land conservation": "Land conservation ensures that farming practices do not degrade the land but instead sustain its fertility. It includes methods like crop rotation, agroforestry, and reducing pesticide use. Want more information on land conservation strategies?",
  "Poultry care": "Poultry care involves providing proper housing, food, water, and disease management for chickens, ducks, and turkeys. Would you like tips on how to care for your poultry?",
  "Farming laws": "Farming laws govern how farms operate, including land use, animal welfare, and environmental regulations. Would you like to know more about farming laws in your region?",
  "Biological pest control": "Biological pest control involves using natural predators, such as ladybugs or predatory beetles, to control pests. It’s an eco-friendly approach to pest management. Interested in biological pest control methods?",
  "Windbreaks": "Windbreaks are rows of trees or shrubs planted to protect crops from wind erosion and damage. Want to learn how to plant effective windbreaks on your farm?",
  "Farming technologies": "Farming technologies include drones, GPS, sensors, and other tools to improve productivity. Want to explore the latest farming technologies that can help your crops thrive?",
  "Pollination services": "Pollination services involve renting bees or other insects to help pollinate crops. This is important for fruit and vegetable production. Interested in learning more about how pollination services work?",
  "Soil amendments": "Soil amendments are materials added to the soil to improve its fertility and structure. Common amendments include compost, manure, and lime. Do you need help with choosing the right soil amendments for your crops?",
  "Agricultural cooperatives": "Agricultural cooperatives are groups of farmers working together to share resources and improve market access. Would you like to know how to join or form a cooperative in your area?",
  "Farm profitability": "Farm profitability depends on factors like crop yield, market prices, and input costs. Want advice on increasing the profitability of your farm?",
  "Farming community": "Farming communities are networks of farmers and agricultural workers who support each other and share knowledge. Would you like to learn more about connecting with a farming community in your area?",
  "Sustainable agriculture": "Sustainable agriculture involves farming practices that conserve resources, protect ecosystems, and provide long-term food security. Want to learn more about sustainable practices for your farm?",
  "Tomato": "Tomatoes prefer well-drained, fertile soil with a pH between 6.0 and 6.8. They thrive in temperatures between 18°C and 24°C and need regular watering to maintain consistent moisture levels.",
  "Cucumber": "Cucumbers require loose, well-drained soil with a pH of 6.0 to 7.0. They grow best in temperatures between 18°C and 30°C, and consistent watering is essential to avoid stress and fruit damage.",
  "Potato": "Potatoes thrive in cool temperatures between 15°C and 20°C. They prefer loose, sandy soil with a pH of 5.8 to 6.5 and need deep, infrequent watering to prevent rot.",
  "Apple": "Apple trees need well-drained, slightly acidic soil with a pH of 6.0 to 7.0. They thrive in cooler climates with temperatures between 18°C and 24°C and require moderate watering to avoid waterlogging.",
  "Banana": "Bananas require a warm climate with temperatures between 26°C and 30°C. They prefer well-drained, loamy soil with a pH of 5.5 to 6.5 and need consistent watering during dry periods.",
  "Corn": "Corn grows best in fertile, well-drained soil with a pH of 5.8 to 7.0. It prefers temperatures between 21°C and 30°C and needs plenty of water, especially during tasseling and pollination.",
  "Grape": "Grapevines thrive in warm climates with temperatures between 18°C and 25°C. They prefer well-drained soil with a pH of 6.0 to 6.5 and need deep watering during dry periods.",
  "Strawberry": "Strawberries prefer well-drained, fertile soil with a slightly acidic pH of 5.5 to 6.5. They grow best in temperatures between 15°C and 25°C and need consistent moisture, especially during fruiting.",
  "Watermelon": "Watermelons require sandy, well-drained soil with a pH of 6.0 to 6.8. They thrive in hot climates with temperatures between 25°C and 30°C and need regular watering during fruit formation.",
  "Onion": "Onions grow best in well-drained, loamy soil with a pH of 6.0 to 7.0. They prefer temperatures between 13°C and 24°C and need consistent watering but should not be overwatered.",
  "Peach": "Peach trees prefer well-drained, loamy soil with a slightly acidic pH of 6.0 to 7.0. They thrive in temperatures between 18°C and 24°C and need moderate watering to avoid waterlogging.",
  "Pear": "Pear trees require well-drained, fertile soil with a pH of 6.0 to 6.5. They grow best in temperatures between 18°C and 24°C and need regular watering to ensure proper fruit development.",
  "Lettuce": "Lettuce prefers cool weather and grows best in temperatures between 15°C and 20°C. It requires well-drained, slightly acidic soil with a pH of 6.0 to 6.8 and consistent moisture.",
  "Carrot": "Carrots thrive in loose, sandy soil with a pH of 6.0 to 6.8. They grow best in temperatures between 16°C and 21°C and need consistent watering to ensure proper root development.",
  "Spinach": "Spinach prefers cooler temperatures, around 10°C to 20°C, and well-drained, fertile soil with a pH of 6.5 to 7.0. Regular watering is essential for healthy growth.",
  "Garlic": "Garlic grows best in fertile, well-drained soil with a pH of 6.0 to 7.0. It prefers temperatures between 13°C and 24°C and needs moderate watering, especially during dry periods.",
  "Zucchini": "Zucchini prefers well-drained, fertile soil with a pH of 6.0 to 7.5. It grows best in warm temperatures between 18°C and 29°C and requires consistent watering to maintain moisture.",
  "Cabbage": "Cabbage thrives in cool weather, with temperatures between 15°C and 20°C. It prefers well-drained, fertile soil with a pH of 6.0 to 6.5 and requires regular watering to prevent bolting.",
  "Cauliflower": "Cauliflower grows best in cool climates, with temperatures between 15°C and 21°C. It prefers well-drained, slightly acidic soil with a pH of 6.0 to 7.0 and needs consistent watering.",
  "Broccoli": "Broccoli thrives in temperatures between 18°C and 22°C and prefers well-drained, fertile soil with a pH of 6.0 to 7.0. Regular watering is essential for optimal growth.",
  "Eggplant": "Eggplant prefers warm temperatures between 20°C and 30°C and well-drained, fertile soil with a pH of 5.5 to 6.5. It requires regular watering and good sunlight for strong growth.",
  "Sweet Pepper": "Sweet peppers grow best in warm temperatures between 18°C and 30°C and need well-drained, slightly acidic soil with a pH of 6.0 to 6.8. Consistent watering is necessary for healthy fruit development.",
  "Chili Pepper": "Chili peppers thrive in hot climates with temperatures between 25°C and 30°C. They prefer well-drained, fertile soil with a pH of 6.0 to 7.0 and need regular watering to prevent stress.",
  "Pumpkin": "Pumpkins grow best in well-drained, loamy soil with a pH of 6.0 to 6.8. They thrive in warm temperatures between 18°C and 30°C and require consistent watering during fruit formation.",
  "Avocado": "Avocado trees prefer well-drained, fertile soil with a pH of 6.0 to 6.5. They thrive in warm climates with temperatures between 20°C and 30°C and need moderate watering, especially during dry spells.",
  "Mango": "Mango trees grow best in warm climates with temperatures between 25°C and 30°C. They prefer well-drained, sandy soil with a pH of 5.5 to 7.5 and need deep, infrequent watering.",
  "Papaya": "Papayas thrive in warm, tropical climates with temperatures between 25°C and 30°C. They prefer well-drained, fertile soil with a pH of 6.0 to 6.5 and require regular watering.",
  "Pineapple": "Pineapples grow best in warm climates with temperatures between 20°C and 30°C. They prefer well-drained, sandy soil with a pH of 4.5 to 6.5 and need moderate watering.",
  "Lemon": "Lemon trees require well-drained, slightly acidic soil with a pH of 5.5 to 6.5. They thrive in warm temperatures between 18°C and 30°C and need consistent watering to prevent fruit drop.",
  "Orange": "Orange trees grow best in well-drained, fertile soil with a pH of 6.0 to 7.0. They thrive in warm climates with temperatures between 20°C and 30°C and need regular watering.",
  "Olive": "Olives grow best in dry, well-drained, rocky soil with a pH of 6.0 to 8.0. They thrive in warm, Mediterranean climates and require minimal watering once established.",
  "Pomegranate": "Pomegranates thrive in warm, dry climates with temperatures between 20°C and 30°C. They prefer well-drained, loamy soil with a pH of 6.0 to 7.0 and need regular watering.",
  "Kiwi": "Kiwi vines thrive in temperate climates with temperatures between 15°C and 25°C. They prefer well-drained, fertile soil with a pH of 6.0 to 6.5 and require moderate watering.",
  "Cantaloupe": "Cantaloupes prefer warm climates with temperatures between 21°C and 29°C. They grow best in well-drained soil with a pH of 6.0 to 6.5 and require consistent watering during fruiting.",
  "Cherries": "Cherry trees thrive in well-drained, fertile soil with a pH of 6.0 to 7.0. They grow best in cool climates with temperatures between 18°C and 24°C and need moderate watering.",
  "Blackberries": "Blackberries prefer well-drained, slightly acidic soil with a pH of 5.5 to 6.5. They thrive in temperatures between 20°C and 28°C and require consistent watering.",
  "Raspberries": "Raspberries thrive in well-drained, slightly acidic soil with a pH of 5.5 to 6.5. They grow best in cool climates with temperatures between 18°C and 22°C and need regular watering.",
  "Ginger": "Ginger grows best in warm, tropical climates with temperatures between 25°C and 30°C. It prefers well-drained, fertile soil with a pH of 5.5 to 6.5 and needs regular watering.",
  "Turmeric": "Turmeric thrives in tropical climates with temperatures between 25°C and 30°C. It prefers well-drained, fertile soil with a pH of 5.5 to 6.5 and requires consistent watering.",
  "Coconut": "Coconuts grow best in tropical climates with temperatures between 25°C and 30°C. They prefer well-drained, sandy soil with a pH of 5.0 to 8.0 and need regular watering.",
  "Cabbage": "Cabbage thrives in cool temperatures between 15°C and 20°C. It prefers well-drained, fertile soil with a pH of 6.0 to 6.5 and requires regular watering to prevent bolting.",
  "Lettuce": "Lettuce prefers cool weather and grows best in temperatures between 15°C and 20°C. It requires well-drained, slightly acidic soil with a pH of 6.0 to 6.8 and consistent moisture.",
  "Farming": "Farming involves the cultivation of crops and the rearing of animals. There are many types of farming, from traditional to modern practices, each tailored to specific environments and resources. What kind of farming would you like to know more about?",
  "http://localhost:5173/src/assets/img/foxbot.png": "heyyyyy thats me don't play with me -_-......i'm leaving bye!",
  "how to prevent wheat pests":"To prevent wheat pests effectively, implement integrated pest management (IPM) strategies. Rotate crops to break pest life cycles, use pest-resistant wheat varieties, and adjust planting times to avoid peak pest emergence. Encourage natural predators like ladybugs for aphids and parasitic wasps for caterpillars. Keep fields weed-free and use trap crops like oats to divert pests such as wheat stem sawflies. Organic solutions like neem oil, Bacillus thuringiensis (Bt), and diatomaceous earth can help control infestations. For stored wheat, maintain dry, airtight storage conditions. Regular field inspections, healthy soil management, and companion planting with repellent crops like garlic and mustard further enhance pest resistance. ",
  "Watering schedule for rice":"Rice requires consistent water management throughout its growth cycle, as it is a semi-aquatic crop. During land preparation and sowing (0-14 days), maintaining 2-5 cm of standing water helps seedlings establish while preventing excessive flooding. In the vegetative stage (15-45 days), increasing the water depth to 5-7 cm supports tillering (shoot development) while ensuring proper drainage to prevent root rot. The reproductive stage (46-90 days) is the most critical for grain formation, requiring a steady 7-10 cm of water to avoid yield reduction due to water stress. As the crop reaches maturity (91-120 days), water levels should gradually decrease, and irrigation should be stopped 7-10 days before harvest to allow the field to dry, making harvesting easier. For rainfed rice, water availability depends on rainfall, so techniques like bunding (small barriers) and alternate wetting and drying (AWD) help conserve moisture and optimize yield.",
  
};



function FarmingChatbot() {
  const [messages, setMessages] = useState([{ text: "Hello! Ask me anything about farming.", sender: "bot" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();  

useEffect(() => {
  const loggedInUser = localStorage.getItem('token'); // Assuming login token is stored
  if (!loggedInUser) {
    navigate('/');  // Redirect to home if not logged in
  }
}, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTemperature = async (location) => {
    try {
      const response = await axios.get(`https://wttr.in/${location}?format=%t`);
      return response.data;
    } catch (error) {
      return "unavailable";
    }
  };

  const getBotResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Extract city and crop names from the message
    let city = cities.find(city => lowerMessage.includes(city.value.toLowerCase()));
    let crop = farmingKeywords.find(keyword => lowerMessage.includes(keyword));

    // Check if the message matches any farming keyword
    const keywordResponse = Object.keys(farmingKeywordsReplies).find(keyword => lowerMessage.includes(keyword.toLowerCase()));
    if (keywordResponse) {
      return farmingKeywordsReplies[keywordResponse];
    }

    if (lowerMessage.includes("temperature in")) {
      const location = lowerMessage.replace("temperature in ", "").trim();
      const temp = await fetchTemperature(location);
      return `The temperature in ${location} is ${temp}`;
    }

    // Handle the case where both city and crop are found
    if (city && crop) {
      setLoading(true);
      setMessages(prev => [...prev, { text: "Fetching weather data and advice...", sender: "bot" }]);

      try {
        const response = await axios.get(`http://localhost:8000/api/v1/ai_crop_assistance/crop_assistance/`, {
          params: { crop: crop, city: city.value }
        });
        const advice = response.data;
        let adviceText = `Temperature: ${advice.temperature}°C\nHumidity: ${advice.humidity || 'Data unavailable'}%\nSoil Moisture: ${advice.soil_moisture || 'Data unavailable'}%\nPrecipitation: ${advice.precipitation || 'Data unavailable'} mm\nWeather Condition: ${advice.weather_condition || 'Data unavailable'}\nWatering Advice: ${advice.watering}\nPests to Watch: ${advice.pests}`;
        setMessages(prev => [...prev, { text: adviceText, sender: "bot" }]);
      } catch (err) {
        setMessages(prev => [...prev, { text: "Failed to fetch data. Please try again.", sender: "bot" }]);
      }

      setLoading(false);
      return;
    }

    // If no city and crop found, and no farming-related keyword, provide a default response
    return "I'm still learning! Try asking about farming, crops, irrigation, or pest control.";
  };

  const typingIntervalRef = useRef(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
  
    // Stop previous typing effect if running
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  
    // Add user message
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
  
    setInput("");
  
    // Add "Typing..." message
    setMessages((prev) => [...prev, { text: "Typing...", sender: "bot" }]);
  
    const botReply = await getBotResponse(input);
  
    // Remove "Typing..." before displaying bot response
    setMessages((prev) => prev.filter((msg) => msg.text !== "Typing..."));
  
    // Use typing effect to display the bot's response
    simulateTypingEffect(botReply);
  };
  
  const simulateTypingEffect = (fullText) => {
    let currentText = "";
    let index = 0;
  
    // Stop previous typing effect if running
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
  
    typingIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        index++;
  
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
  
          if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1]?.sender === "bot") {
            updatedMessages[updatedMessages.length - 1].text = currentText;
          } else {
            updatedMessages.push({ text: currentText, sender: "bot" });
          }
  
          return updatedMessages;
        });
      } else {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }, 40);
  };
  
  // Clicking a tip should send that message
  const handleTipClick = (message) => {
    setInput(message);
    handleSendMessage();
  };
  

  return (
    <div className="chat-page">
  {/* Heading */}
  <h1 style={styles.heading}>AI FoxAssistant</h1>
    
    <div className="chat-container" style={styles.chatContainer}>
      <img src={foxImage} alt="Chatbox Icon" style={styles.chatboxIcon} />
      <div className="chat-box" style={styles.chatBox}>
      {messages.length === 1 && messages[0].sender === "bot" && (
  <div style={styles.tipsContainer}>
    <p style={styles.tipText}>💡 Try asking:</p>
    <ul style={styles.tipList}>
      <li onClick={() => handleTipClick("Best crops for summer?")}>🌾 Best crops for summer?</li>
      <li onClick={() => handleTipClick("How to prevent wheat pests?")}>🐛 How to prevent wheat pests?</li>
      <li onClick={() => handleTipClick("Watering schedule for rice?")}>💧 Watering schedule for rice?</li>
      <li onClick={() => handleTipClick("Temperature in Delhi")}>🌡️ Temperature in Delhi?</li>
    </ul>
  </div>
)}

        
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ ...styles.message, alignSelf: msg.sender === "bot" ? "flex-start" : "flex-end" }}
          >
            {msg.text}
            
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask me about farming, e.g. 'Tell me about wheat in Delhi'"
          style={styles.input}
          
        />
        
        <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
      </div>
    </div>
    </div>
  );
}


const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    width: "60vw", // Larger width
    height: "80vh", // Taller for better usability
    position: "relative",
    background: "linear-gradient(135deg, rgba(37, 205, 210, 0.78), rgba(255, 255, 255, 0.54))",
    border: "2px solid rgba(255, 255, 255, 0)", // Futuristic glowing border
    boxShadow: "0 0 15px rgba(251, 255, 255, 0)", // Neon shadow effect
    overflow: "hidden",
    backdropFilter: "blur(10px)", // Glass-like effect
    borderRadius: "0", // Removes rounded edges
    padding: "20px",
  },
  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "rgba(124, 227, 136, 0)", // Semi-transparent futuristic background
    borderBottom: "2px solid rgba(0, 255, 255, 0)", 
  },
  message: {
    maxWidth: "75%",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    wordWrap: "break-word",
    backgroundColor: "rgba(16, 72, 61, 0.54)", // Slight neon glow
    color: "#fff",
    textShadow: "0 0 5px rgb(0, 6, 6)",
    boxShadow: "0px 2px 10px rgba(0, 255, 255, 0.2)",
    border: "1px solid rgba(0, 255, 255, 0.1)",
  },
  inputContainer: {
    display: "flex",
    padding: "15px 20px",
    background: "rgba(0, 150, 35, 0.5)",
    borderTop: "2px solid rgba(25, 106, 106, 0.48)",
    backdropFilter: "blur(10px)",
  },
  input: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid rgba(0, 255, 255, 0.09)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#0ff",
    fontSize: "16px",
    textShadow: "0 0 5px rgba(0, 255, 255, 0)",
  },
  sendButton: {
    marginLeft: "15px",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(0, 255, 42, 0.8)",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(12, 106, 150, 0.6)",
    
  },
  animatedEffects: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle, rgba(0, 255, 255, 0.2) 20%, rgba(0, 150, 136, 0.5) 50%)",
    zIndex: "-1",
  },
  chatboxIcon: {
    position: "absolute",
    top: "10px", // Distance from the top
    right: "10px", // Distance from the right
    width: "60px", // Adjust image size
    height: "60px",
    cursor: "pointer",
    zIndex: "10", // Ensures it stays on top
  },
  heading: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#7fffd4", // Neon green
    textShadow: "0 0 10px rgba(47, 121, 171, 0.8)", // Glowing effect
  },
  tipsContainer: {
    background: "rgba(255, 255, 255, 0.2)", 
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "10px",
    color: "#000",  // Text is black now
    fontSize: "14px",
  },
  
  tipText: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "5px",
  },
  
  tipList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    lineHeight: "1.6",
  },
  
  
    

  
 
    
  
  
};



export default FarmingChatbot;
