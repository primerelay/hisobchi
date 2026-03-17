export const DEFAULT_IMAGES = {
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  drink: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop',
  service: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&h=200&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
  user: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
} as const;

// Specific food images for sample data
export const FOOD_IMAGES = {
  osh: 'https://media-cdn.tripadvisor.com/media/photo-s/1c/27/72/61/osh-plov.jpg',
  dimlama: 'https://i.ytimg.com/vi/F4x32dr-IDo/maxresdefault.jpg',
  jiz: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop',
  qiymaShashlik: 'https://api.silkphoto.uz/storage/ResourceThumbnail/affa9dd2-9541-411d-b456-0aa2e264b094/YWZmYTlkZDItOTU0MS00MTFkLWI0NTYtMGFhMmUyNjRiMDk0LTE3MzcwMTAyNTg=.webp',
  baliq: 'https://i.ytimg.com/vi/xbGnvzigQmk/maxresdefault.jpg',
  salat: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
  achiqChuchuk: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=200&h=200&fit=crop',
  non: 'https://dostavo4ka.uz/upload-file/2021/07/05/6239/750x750-9b2d792c-266d-41c6-af4c-e50ddcd703ed.jpg',
  yarimNon: 'https://w7.pngwing.com/pngs/547/172/png-transparent-tandoor-bread-cafe-croissant-flatbread-menu-bread-food-cafe-bread.png',
  pepsi: 'https://api.lochin.uz/media/file/image/2021-03/d2c0089b-a4b9-4e85-82a8-71dbc667b6e0.jpg.500x500_q85_crop-scale.jpg',
  fanta: 'https://bazarstore.az/cdn/shop/products/30009814_af60888f-3cb9-413a-8d49-af456ed2d455.jpg',
  suv: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop',
  service: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&h=200&fit=crop',
} as const;

export const DEFAULT_SETTINGS = {
  currency: 'UZS',
  timezone: 'Asia/Tashkent',
  commissionEnabled: false,
  defaultCommission: 10,
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const SYNC = {
  maxRetries: 5,
  retryDelayMs: 1000,
  heartbeatIntervalMs: 30000,
} as const;

export const SAMPLE_MENU_ITEMS = [
  { name: 'Osh', price: 45000, category: 'food' as const, image: 'https://media-cdn.tripadvisor.com/media/photo-s/1c/27/72/61/osh-plov.jpg' },
  { name: 'Dimlama', price: 55000, category: 'food' as const, image: 'https://i.ytimg.com/vi/F4x32dr-IDo/maxresdefault.jpg' },
  { name: 'Jiz', price: 65000, category: 'food' as const, image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop' },
  { name: 'Qiyma shashlik', price: 35000, category: 'food' as const, image: 'https://api.silkphoto.uz/storage/ResourceThumbnail/affa9dd2-9541-411d-b456-0aa2e264b094/YWZmYTlkZDItOTU0MS00MTFkLWI0NTYtMGFhMmUyNjRiMDk0LTE3MzcwMTAyNTg=.webp' },
  { name: 'Tovuq shashlik', price: 40000, category: 'food' as const, image: 'https://main-cdn.sbermegamarket.ru/big1/hlr-system/-18/209/326/221/420/9/100030440613b0.jpg' },
  { name: 'Baliq', price: 70000, category: 'food' as const, image: 'https://i.ytimg.com/vi/xbGnvzigQmk/maxresdefault.jpg' },
  { name: 'Achiq-chuchuk', price: 15000, category: 'food' as const, image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=200&h=200&fit=crop' },
  { name: 'Salat', price: 18000, category: 'food' as const, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
  { name: 'Butun Non', price: 3000, category: 'food' as const, image: 'https://dostavo4ka.uz/upload-file/2021/07/05/6239/750x750-9b2d792c-266d-41c6-af4c-e50ddcd703ed.jpg' },
  { name: 'Yarim Non', price: 1500, category: 'food' as const, image: 'https://w7.pngwing.com/pngs/547/172/png-transparent-tandoor-bread-cafe-croissant-flatbread-menu-bread-food-cafe-bread.png' },
  { name: 'Qatiq', price: 8000, category: 'food' as const, image: 'https://i.kayserianadoluhaber.com.tr/c/60/1280x720/s/dosya/haber/ev-yapimi-cacik-tarifi-turk-mu_1688813166_pCJhOX.jpg' },
  { name: 'Coca-Cola 0.5L', price: 8000, category: 'drink' as const, image: 'https://magnumopt.kz/upload/iblock/383/383f8eda97fd436543b980d14d37d395.png' },
  { name: 'Coca-Cola 2.5L', price: 22000, category: 'drink' as const, image: 'https://static.tildacdn.com/tild3439-3831-4666-a263-626431316433/photo.jpeg' },
  { name: 'Pepsi 0.5L', price: 8000, category: 'drink' as const, image: 'https://www.neko-sushi.com.ua/wp-content/uploads/2025/01/pepsi-05-scaled.jpg' },
  { name: 'Pepsi 1L', price: 12000, category: 'drink' as const, image: 'https://api.lochin.uz/media/file/image/2021-03/d2c0089b-a4b9-4e85-82a8-71dbc667b6e0.jpg.500x500_q85_crop-scale.jpg' },
  { name: 'Fanta 0.5L', price: 8000, category: 'drink' as const, image: 'https://api.lesailes.uz/storage/products/2025/08/04/73S050A84fMU8L95mqc4yY9YUiEYz4vrKYqQsP7y.png' },
  { name: 'Fanta 1L', price: 12000, category: 'drink' as const, image: 'https://bazarstore.az/cdn/shop/products/30009814_af60888f-3cb9-413a-8d49-af456ed2d455.jpg' },
  { name: 'Suv 0.5L', price: 3000, category: 'drink' as const, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop' },
  { name: 'Suv 1L', price: 5000, category: 'drink' as const, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop' },
  { name: 'Choy', price: 5000, category: 'drink' as const, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop' },
  { name: 'Turar Joy', price: 50000, category: 'service' as const, image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&h=200&fit=crop' },
  { name: 'Ovqat Pishirish', price: 30000, category: 'service' as const, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop' },
];

export const SAMPLE_ROOMS = [
  'Xona 1',
  'Xona 2',
  'Xona 3',
  'Xona 4',
  'Xona 5',
];

// Pre-defined food images for menu items
export const MENU_ITEM_IMAGES = {
  food: [
    // Palovlar
    { name: 'Osh / Palov', url: 'https://media-cdn.tripadvisor.com/media/photo-s/1c/27/72/61/osh-plov.jpg' },
    { name: 'Samarqand oshi', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop' },
    { name: 'To\'y oshi', url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=300&h=300&fit=crop' },
    { name: 'Sabzili palov', url: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&h=300&fit=crop' },

    // Go'shtli taomlar
    { name: 'Go\'sht taom', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop' },
    { name: 'Qovurilgan go\'sht', url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&h=300&fit=crop' },
    { name: 'Mol go\'shti', url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300&h=300&fit=crop' },
    { name: 'Qo\'y go\'shti', url: 'https://images.unsplash.com/photo-1608877907149-a206d75ba011?w=300&h=300&fit=crop' },
    { name: 'Jiz', url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=300&fit=crop' },
    { name: 'Dimlama', url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=300&h=300&fit=crop' },
    { name: 'Bosma go\'sht', url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=300&fit=crop' },

    // Kaboblar va shashliklar
    { name: 'Shashlik', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop' },
    { name: 'Qiyma shashlik', url: 'https://api.silkphoto.uz/storage/ResourceThumbnail/affa9dd2-9541-411d-b456-0aa2e264b094/YWZmYTlkZDItOTU0MS00MTFkLWI0NTYtMGFhMmUyNjRiMDk0LTE3MzcwMTAyNTg=.webp' },
    { name: 'Burda-burda shashlik', url: 'https://avatars.mds.yandex.net/get-altay/16368192/2a0000019a963a678442156dfc1fb48edfd4/XXL_height' },
    { name: 'Tovuq shashlik', url: 'https://main-cdn.sbermegamarket.ru/big1/hlr-system/-18/209/326/221/420/9/100030440613b0.jpg' },
    { name: 'Kabob', url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&h=300&fit=crop' },
    { name: 'Qozon kabob', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=300&fit=crop' },
    { name: 'Jigar kabob', url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop' },
    { name: 'Lyulya kabob', url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=300&h=300&fit=crop' },
    { name: 'Tandir kabob', url: 'https://images.unsplash.com/photo-1606502281004-f86cf1282af5?w=300&h=300&fit=crop' },

    // Tovuq
    { name: 'Tovuq', url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=300&fit=crop' },
    { name: 'Qovurilgan tovuq', url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop' },
    { name: 'Tovuq kabob', url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=300&fit=crop' },
    { name: 'Grillangan tovuq', url: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=300&h=300&fit=crop' },
    { name: 'Tovuq qanoti', url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=300&fit=crop' },
    { name: 'Tabaka tovuq', url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=300&h=300&fit=crop' },

    // Baliq
    { name: 'Baliq', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=300&fit=crop' },
    { name: 'Qovurilgan baliq', url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=300&h=300&fit=crop' },
    { name: 'Grillangan baliq', url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=300&h=300&fit=crop' },
    { name: 'Baliq filesi', url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=300&h=300&fit=crop' },
    { name: 'Baliq kabob', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop' },

    // Sho'rvalar
    { name: 'Sho\'rva', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=300&fit=crop' },
    { name: 'Mastava', url: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=300&h=300&fit=crop' },
    { name: 'Lagmon sho\'rva', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop' },
    { name: 'Moxora', url: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=300&h=300&fit=crop' },

    // Lag'mon va xamir taomlar
    { name: 'Lag\'mon', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop' },
    { name: 'Qovurma lag\'mon', url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=300&fit=crop' },
    { name: 'Chuchvara', url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=300&fit=crop' },
    { name: 'Manti', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=300&fit=crop' },
    { name: 'Somsa', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300&h=300&fit=crop' },
    { name: 'Go\'shtli somsa', url: 'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=300&h=300&fit=crop' },
    { name: 'Qiymali somsa', url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop' },
    { name: 'Hanun', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop' },

    // Non va pishiriqlar
    { name: 'Butun non', url: 'https://dostavo4ka.uz/upload-file/2021/07/05/6239/750x750-9b2d792c-266d-41c6-af4c-e50ddcd703ed.jpg' },
    { name: 'Yarim non', url: 'https://w7.pngwing.com/pngs/547/172/png-transparent-tandoor-bread-cafe-croissant-flatbread-menu-bread-food-cafe-bread.png' },
    { name: 'Tandir non', url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=300&fit=crop' },
    { name: 'Patir non', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop' },
    { name: 'Kulcha', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop' },
    { name: 'Qatlama', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop' },

    // Salatlar
    { name: 'Salat', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop' },
    { name: 'Achiq-chuchuk', url: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=300&h=300&fit=crop' },
    { name: 'Pomidor piyoz salat', url: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=300&h=300&fit=crop' },
    { name: 'Bodring salat', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop' },
    { name: 'Sabzavotli salat', url: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=300&h=300&fit=crop' },
    { name: 'Karam salat', url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=300&fit=crop' },
    { name: 'Sezar salat', url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&h=300&fit=crop' },
    { name: 'Olivye', url: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=300&h=300&fit=crop' },
    { name: 'Toshkent salat', url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&h=300&fit=crop' },
    { name: 'Vinegret', url: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=300&h=300&fit=crop' },
    { name: 'Grek salat', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop' },

    // Sut mahsulotlari va boshqa
    { name: 'Qatiq', url: 'https://i.kayserianadoluhaber.com.tr/c/60/1280x720/s/dosya/haber/ev-yapimi-cacik-tarifi-turk-mu_1688813166_pCJhOX.jpg' },
    { name: 'Suzma', url: 'https://images.unsplash.com/photo-1571167366136-b57e07761625?w=300&h=300&fit=crop' },
    { name: 'Qaymok', url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=300&h=300&fit=crop' },

    // Boshqa taomlar
    { name: 'Tuxum', url: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=300&h=300&fit=crop' },
    { name: 'Quyruq', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=300&fit=crop' },
    { name: 'Naryn', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop' },
    { name: 'Qazi', url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=300&fit=crop' },
    { name: 'Boshqa taom', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop' },
  ],
  drink: [
    // Pepsi
    { name: 'Pepsi 0.5L', url: 'https://www.neko-sushi.com.ua/wp-content/uploads/2025/01/pepsi-05-scaled.jpg' },
    { name: 'Pepsi 1L', url: 'https://api.lochin.uz/media/file/image/2021-03/d2c0089b-a4b9-4e85-82a8-71dbc667b6e0.jpg.500x500_q85_crop-scale.jpg' },
    { name: 'Pepsi 2L', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop' },

    // Fanta
    { name: 'Fanta 0.5L', url: 'https://api.lesailes.uz/storage/products/2025/08/04/73S050A84fMU8L95mqc4yY9YUiEYz4vrKYqQsP7y.png' },
    { name: 'Fanta 1L', url: 'https://bazarstore.az/cdn/shop/products/30009814_af60888f-3cb9-413a-8d49-af456ed2d455.jpg' },
    { name: 'Fanta 2.5L', url: 'https://images.migrosone.com/sanalmarket/product/08022690/08022690_1-857620-1650x1650.png' },

    // Coca-Cola
    { name: 'Coca-Cola 0.5L', url: 'https://magnumopt.kz/upload/iblock/383/383f8eda97fd436543b980d14d37d395.png' },
    { name: 'Coca-Cola 2.5L', url: 'https://static.tildacdn.com/tild3439-3831-4666-a263-626431316433/photo.jpeg' },

    // Boshqa gazli ichimliklar
    { name: 'Sprite', url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=300&h=300&fit=crop' },
    { name: '7up', url: 'https://images.unsplash.com/photo-1632818924360-68d4994cfdb2?w=300&h=300&fit=crop' },
    { name: 'Gazli ichimlik', url: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=300&h=300&fit=crop' },

    // Suv
    { name: 'Suv', url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&h=300&fit=crop' },
    { name: 'Mineral suv', url: 'https://images.unsplash.com/photo-1560023907-5f339617ea55?w=300&h=300&fit=crop' },
    { name: 'Gazli suv', url: 'https://images.unsplash.com/photo-1606168094336-48f205276929?w=300&h=300&fit=crop' },

    // Issiq ichimliklar
    { name: 'Choy', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop' },
    { name: 'Ko\'k choy', url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=300&fit=crop' },
    { name: 'Qora choy', url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop' },
    { name: 'Kofe', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop' },
    { name: 'Amerikano', url: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=300&h=300&fit=crop' },
    { name: 'Cappuccino', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop' },
    { name: 'Latte', url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=300&h=300&fit=crop' },

    // Sharbat va soklar
    { name: 'Sharbat', url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300&h=300&fit=crop' },
    { name: 'Limonad', url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&h=300&fit=crop' },
    { name: 'Apelsin sharbati', url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop' },
    { name: 'Olma sharbati', url: 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=300&h=300&fit=crop' },
    { name: 'Anor sharbati', url: 'https://images.unsplash.com/photo-1560526860-1f0e56046c85?w=300&h=300&fit=crop' },
    { name: 'Uzum sharbati', url: 'https://images.unsplash.com/photo-1568702846914-96b305d2ebb1?w=300&h=300&fit=crop' },
    { name: 'Mango sharbati', url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300&h=300&fit=crop' },
    { name: 'Aralash sok', url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=300&fit=crop' },

    // Sut mahsulotlari
    { name: 'Ayron', url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=300&fit=crop' },
    { name: 'Qatiq', url: 'https://images.unsplash.com/photo-1571167366136-b57e07761625?w=300&h=300&fit=crop' },
    { name: 'Sut', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop' },
    { name: 'Milkshake', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=300&fit=crop' },

    // Energetik
    { name: 'Red Bull', url: 'https://images.unsplash.com/photo-1613225587821-1a7c7db2a9ec?w=300&h=300&fit=crop' },
    { name: 'Energetik ichimlik', url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=300&h=300&fit=crop' },

    { name: 'Boshqa ichimlik', url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop' },
  ],
  service: [
    { name: 'Xizmat', url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300&h=300&fit=crop' },
    { name: 'Oshpaz xizmati', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop' },
    { name: 'Turar joy', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=300&fit=crop' },
    { name: 'Yetkazib berish', url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&h=300&fit=crop' },
    { name: 'Boshqa xizmat', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop' },
  ],
} as const;
