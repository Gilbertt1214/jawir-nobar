import type { NekoBoccHentai, PaginatedResponse } from "./types";

export const mockNekoBoccData: NekoBoccHentai[] = [
    // Overflow Series (Season 1) - 8 episodes
    {
        type: "hentai",
        id: "overflow-episode-1",
        title: "Overflow Episode 1 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/01/Overflow-Episode-1-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Kazushi Sudou adalah seorang siswa SMA yang tinggal sendiri. Suatu hari, dia bertemu dengan dua saudara perempuan tetangganya, Ayane dan Kotone Shirakawa, di pemandian umum yang mengarah ke situasi yang tidak terduga.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "150MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
            {
                quality: "720p",
                size: "100MB",
                url: "https://mega.nz/",
                type: "Mega",
            },
            {
                quality: "480p",
                size: "50MB",
                url: "https://mediafire.com/",
                type: "MediaFire",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/overflow-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/overflow-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "overflow-episode-2",
        title: "Overflow Episode 2 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/01/Overflow-Episode-2-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Kelanjutan dari episode sebelumnya. Hubungan antara Kazushi dengan Ayane dan Kotone semakin berkembang.",
    },
    {
        type: "hentai",
        id: "overflow-episode-3",
        title: "Overflow Episode 3 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/02/Overflow-Episode-3-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Episode ketiga dari seri Overflow. Situasi menjadi semakin rumit dan menarik.",
    },
    {
        type: "hentai",
        id: "overflow-episode-4",
        title: "Overflow Episode 4 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/02/Overflow-Episode-4-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Kazushi harus membuat keputusan penting tentang hubungannya dengan kedua saudara perempuan.",
    },
    {
        type: "hentai",
        id: "overflow-episode-5",
        title: "Overflow Episode 5 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/03/Overflow-Episode-5-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis: "Konflik baru muncul yang menguji hubungan mereka bertiga.",
    },
    {
        type: "hentai",
        id: "overflow-episode-6",
        title: "Overflow Episode 6 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/03/Overflow-Episode-6-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Ayane dan Kotone bersaing untuk mendapatkan perhatian Kazushi.",
    },
    {
        type: "hentai",
        id: "overflow-episode-7",
        title: "Overflow Episode 7 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/04/Overflow-Episode-7-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Situasi mencapai klimaks dengan kejadian yang tidak terduga.",
    },
    {
        type: "hentai",
        id: "overflow-episode-8",
        title: "Overflow Episode 8 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2020/04/Overflow-Episode-8-Subtitle-Indonesia.jpg",
        genre: ["Hentai", "Romance", "School", "Ecchi"],
        duration: "8 min",
        synopsis:
            "Episode final dari season 1. Kazushi membuat keputusan akhir.",
    },

    // Kanojo x Kanojo x Kanojo Series - 3 episodes
    {
        type: "hentai",
        id: "kanojo-x-kanojo-x-kanojo-episode-1",
        title: "Kanojo x Kanojo x Kanojo Episode 1 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2019/12/Kanojo-x-Kanojo-x-Kanojo-Episode-1.jpg",
        genre: ["Hentai", "Romance", "Harem", "School"],
        duration: "28 min",
        synopsis:
            "Shiki Haruomi adalah seorang siswa yang tinggal di rumah besar milik keluarga Honjou. Dia tinggal bersama tiga saudara perempuan cantik yang semuanya memiliki perasaan khusus padanya.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "320MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
            {
                quality: "720p",
                size: "200MB",
                url: "https://mega.nz/",
                type: "Mega",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/kanojo-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/kanojo-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "kanojo-x-kanojo-x-kanojo-episode-2",
        title: "Kanojo x Kanojo x Kanojo Episode 2 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2019/12/Kanojo-x-Kanojo-x-Kanojo-Episode-2.jpg",
        genre: ["Hentai", "Romance", "Harem", "School"],
        duration: "28 min",
        synopsis:
            "Hubungan Shiki dengan ketiga saudara perempuan semakin berkembang dan rumit.",
    },
    {
        type: "hentai",
        id: "kanojo-x-kanojo-x-kanojo-episode-3",
        title: "Kanojo x Kanojo x Kanojo Episode 3 Subtitle Indonesia",
        cover: "https://cdn.nekopoi.care/wp-content/uploads/2019/12/Kanojo-x-Kanojo-x-Kanojo-Episode-3.jpg",
        genre: ["Hentai", "Romance", "Harem", "School"],
        duration: "28 min",
        synopsis:
            "Episode final dari seri ini. Shiki harus membuat keputusan penting tentang hubungannya.",
    },

    // Koushoku no Chuugi Kunoichi Botaru Series - 4 episodes
    {
        type: "hentai",
        id: "koushoku-no-chuugi-kunoichi-botaru-episode-1",
        title: "Koushoku no Chuugi Kunoichi Botaru Episode 1 Subtitle Indonesia",
        cover: "https://i.imgur.com/9KxLmNp.jpg",
        genre: ["Hentai", "Ninja", "Action", "Uncensored"],
        duration: "24 min",
        synopsis:
            "Botaru adalah seorang kunoichi yang sangat setia kepada tuannya. Dia dilatih sejak kecil untuk menjadi ninja terbaik. Suatu hari, dia mendapat misi khusus yang akan mengubah hidupnya selamanya.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "300MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
            {
                quality: "720p",
                size: "200MB",
                url: "https://mega.nz/",
                type: "Mega",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/kunoichi-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/kunoichi-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "koushoku-no-chuugi-kunoichi-botaru-episode-2",
        title: "Koushoku no Chuugi Kunoichi Botaru Episode 2 Subtitle Indonesia",
        cover: "https://i.imgur.com/9KxLmNp.jpg",
        genre: ["Hentai", "Ninja", "Action", "Uncensored"],
        duration: "24 min",
        synopsis:
            "Botaru melanjutkan misinya yang berbahaya. Dia harus menggunakan semua kemampuannya untuk menyelesaikan tugas.",
    },
    {
        type: "hentai",
        id: "koushoku-no-chuugi-kunoichi-botaru-episode-3",
        title: "Koushoku no Chuugi Kunoichi Botaru Episode 3 Subtitle Indonesia",
        cover: "https://i.imgur.com/9KxLmNp.jpg",
        genre: ["Hentai", "Ninja", "Action", "Uncensored"],
        duration: "24 min",
        synopsis:
            "Misi Botaru semakin berbahaya. Dia menghadapi musuh yang kuat.",
    },
    {
        type: "hentai",
        id: "koushoku-no-chuugi-kunoichi-botaru-episode-4",
        title: "Koushoku no Chuugi Kunoichi Botaru Episode 4 Subtitle Indonesia",
        cover: "https://i.imgur.com/9KxLmNp.jpg",
        genre: ["Hentai", "Ninja", "Action", "Uncensored"],
        duration: "24 min",
        synopsis:
            "Episode final. Botaru menghadapi pertarungan terakhir untuk menyelesaikan misinya.",
    },

    // Maid Kyouiku Series - 4 episodes
    {
        type: "hentai",
        id: "maid-kyouiku-episode-1",
        title: "Maid Kyouiku Episode 1 Subtitle Indonesia",
        cover: "https://i.imgur.com/7HxKmPq.jpg",
        genre: ["Hentai", "Maid", "Training", "School"],
        duration: "24 min",
        synopsis:
            "Sebuah akademi khusus untuk melatih pelayan wanita dengan metode yang sangat spesial. Para siswa diajarkan berbagai keterampilan untuk menjadi maid yang sempurna.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "280MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
            {
                quality: "720p",
                size: "180MB",
                url: "https://mega.nz/",
                type: "Mega",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/maid-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/maid-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "maid-kyouiku-episode-2",
        title: "Maid Kyouiku Episode 2 Subtitle Indonesia",
        cover: "https://i.imgur.com/7HxKmPq.jpg",
        genre: ["Hentai", "Maid", "Training", "School"],
        duration: "24 min",
        synopsis:
            "Pelatihan berlanjut dengan metode yang lebih intensif. Para siswa harus menguasai teknik-teknik baru.",
    },
    {
        type: "hentai",
        id: "maid-kyouiku-episode-3",
        title: "Maid Kyouiku Episode 3 Subtitle Indonesia",
        cover: "https://i.imgur.com/7HxKmPq.jpg",
        genre: ["Hentai", "Maid", "Training", "School"],
        duration: "24 min",
        synopsis:
            "Ujian praktik dimulai. Para siswa harus menunjukkan kemampuan mereka.",
    },
    {
        type: "hentai",
        id: "maid-kyouiku-episode-4",
        title: "Maid Kyouiku Episode 4 Subtitle Indonesia",
        cover: "https://i.imgur.com/7HxKmPq.jpg",
        genre: ["Hentai", "Maid", "Training", "School"],
        duration: "24 min",
        synopsis: "Episode final. Kelulusan para siswa ditentukan.",
    },

    // Resort Boin Series - 3 episodes
    {
        type: "hentai",
        id: "resort-boin-episode-1",
        title: "Resort Boin Episode 1 Subtitle Indonesia",
        cover: "https://i.imgur.com/3KxLmNp.jpg",
        genre: ["Hentai", "Beach", "Resort", "Ecchi"],
        duration: "30 min",
        synopsis:
            "Daisuke bekerja di sebuah resort pantai mewah. Dia bertemu dengan berbagai tamu wanita cantik yang datang untuk berlibur.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "340MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/resort-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/resort-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "resort-boin-episode-2",
        title: "Resort Boin Episode 2 Subtitle Indonesia",
        cover: "https://i.imgur.com/3KxLmNp.jpg",
        genre: ["Hentai", "Beach", "Resort", "Ecchi"],
        duration: "30 min",
        synopsis:
            "Petualangan Daisuke di resort berlanjut dengan tamu-tamu baru yang lebih menarik.",
    },
    {
        type: "hentai",
        id: "resort-boin-episode-3",
        title: "Resort Boin Episode 3 Subtitle Indonesia",
        cover: "https://i.imgur.com/3KxLmNp.jpg",
        genre: ["Hentai", "Beach", "Resort", "Ecchi"],
        duration: "30 min",
        synopsis:
            "Episode terakhir dari seri Resort Boin dengan kejutan yang tak terduga.",
    },

    // Kansen Sodom Series - 3 episodes
    {
        type: "hentai",
        id: "kansen-sodom-episode-1",
        title: "Kansen Sodom Episode 1 Subtitle Indonesia",
        cover: "https://i.imgur.com/5NxQmRp.jpg",
        genre: ["Hentai", "Horror", "Zombie", "Survival"],
        duration: "30 min",
        synopsis:
            "Virus misterius menyebar di kota, mengubah orang menjadi zombie dengan nafsu yang tidak terkendali. Sekelompok survivor harus bertahan hidup di tengah kekacauan.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "350MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
            {
                quality: "720p",
                size: "220MB",
                url: "https://mega.nz/",
                type: "Mega",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/kansen-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/kansen-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "kansen-sodom-episode-2",
        title: "Kansen Sodom Episode 2 Subtitle Indonesia",
        cover: "https://i.imgur.com/5NxQmRp.jpg",
        genre: ["Hentai", "Horror", "Zombie", "Survival"],
        duration: "30 min",
        synopsis:
            "Para survivor mencoba mencari tempat aman sambil menghindari zombie yang semakin banyak.",
    },
    {
        type: "hentai",
        id: "kansen-sodom-episode-3",
        title: "Kansen Sodom Episode 3 Subtitle Indonesia",
        cover: "https://i.imgur.com/5NxQmRp.jpg",
        genre: ["Hentai", "Horror", "Zombie", "Survival"],
        duration: "30 min",
        synopsis:
            "Episode final. Para survivor menghadapi pertarungan terakhir untuk bertahan hidup.",
    },

    // Mesu o Karu Mura Series - 3 episodes
    {
        type: "hentai",
        id: "mesu-o-karu-mura-episode-1",
        title: "Mesu o Karu Mura Episode 1 Subtitle Indonesia",
        cover: "https://i.imgur.com/6MxNpQr.jpg",
        genre: ["Hentai", "Village", "Fantasy", "Uncensored"],
        duration: "24 min",
        synopsis:
            "Di sebuah desa terpencil, terdapat tradisi unik yang telah berlangsung selama berabad-abad. Seorang pemuda dari kota datang dan menemukan rahasia desa tersebut.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "290MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/mesu-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/mesu-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "mesu-o-karu-mura-episode-2",
        title: "Mesu o Karu Mura Episode 2 Subtitle Indonesia",
        cover: "https://i.imgur.com/6MxNpQr.jpg",
        genre: ["Hentai", "Village", "Fantasy", "Uncensored"],
        duration: "24 min",
        synopsis:
            "Pemuda tersebut semakin terlibat dalam tradisi desa dan menemukan lebih banyak rahasia.",
    },
    {
        type: "hentai",
        id: "mesu-o-karu-mura-episode-3",
        title: "Mesu o Karu Mura Episode 3 Subtitle Indonesia",
        cover: "https://i.imgur.com/6MxNpQr.jpg",
        genre: ["Hentai", "Village", "Fantasy", "Uncensored"],
        duration: "24 min",
        synopsis: "Episode final. Rahasia terbesar desa terungkap.",
    },

    // Rance 01 Series - 4 episodes
    {
        type: "hentai",
        id: "rance-01-episode-1",
        title: "Rance 01 Episode 1 Subtitle Indonesia",
        cover: "https://i.imgur.com/2JxKmLp.jpg",
        genre: ["Hentai", "Fantasy", "Adventure", "Action"],
        duration: "30 min",
        synopsis:
            "Rance adalah seorang petualang yang terkenal dengan kekuatannya. Dia menerima misi untuk menyelamatkan seorang putri yang diculik oleh monster.",
        downloadLinks: [
            {
                quality: "1080p",
                size: "330MB",
                url: "https://drive.google.com/",
                type: "Google Drive",
            },
            {
                quality: "720p",
                size: "210MB",
                url: "https://mega.nz/",
                type: "Mega",
            },
        ],
        streamLinks: [
            {
                quality: "HD",
                url: "https://hentaistream.com/rance-1",
                provider: "HentaiStream",
            },
            {
                quality: "HD",
                url: "https://www.fembed.com/v/rance-1",
                provider: "Fembed",
            },
        ],
    },
    {
        type: "hentai",
        id: "rance-01-episode-2",
        title: "Rance 01 Episode 2 Subtitle Indonesia",
        cover: "https://i.imgur.com/2JxKmLp.jpg",
        genre: ["Hentai", "Fantasy", "Adventure", "Action"],
        duration: "30 min",
        synopsis:
            "Rance melanjutkan pencariannya dan bertemu dengan berbagai karakter menarik di perjalanan.",
    },
    {
        type: "hentai",
        id: "rance-01-episode-3",
        title: "Rance 01 Episode 3 Subtitle Indonesia",
        cover: "https://i.imgur.com/2JxKmLp.jpg",
        genre: ["Hentai", "Fantasy", "Adventure", "Action"],
        duration: "30 min",
        synopsis:
            "Pertarungan final Rance melawan musuh yang kuat untuk menyelamatkan sang putri.",
    },
    {
        type: "hentai",
        id: "rance-01-episode-4",
        title: "Rance 01 Episode 4 Subtitle Indonesia",
        cover: "https://i.imgur.com/2JxKmLp.jpg",
        genre: ["Hentai", "Fantasy", "Adventure", "Action"],
        duration: "30 min",
        synopsis:
            "Petualangan Rance berlanjut dengan misi baru yang lebih berbahaya.",
    },
];

export function getMockNekoBoccList(
    page: number = 1
): PaginatedResponse<NekoBoccHentai> {
    return {
        data: mockNekoBoccData,
        page,
        totalPages: 1,
        totalItems: mockNekoBoccData.length,
    };
}

export function getMockNekoBoccDetail(id: string): NekoBoccHentai | null {
    return mockNekoBoccData.find((item) => item.id === id) || null;
}
