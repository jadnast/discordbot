const Discord = require('discord.js');
const bot = new Discord.Client();
const path = require('path')
const fs = require('fs')
const cfg = require('./config.json')
const prefix = "!"
bot.commands = new Discord.Collection();
function findFiles(folderPath){
    let files = []
    folderPath = path.isAbsolute(folderPath) ? folderPath : path.join(process.cwd(), folderPath) 
    const thisFolder = fs.readdirSync(folderPath, { withFileTypes: true })                       
                                                                                                 
    for(const file of thisFolder){                                                               
        const pathFile = path.join(folderPath, file.name)                                        
        if(file.isDirectory()){                                                                  
            files = [ ...files, ...findFiles(pathFile) ]                                         
            continue                                                                             
        }                                                                                        
        files.push(pathFile)                                                                     
    }                                                                                            
    return files                                                                                 
}                                                                                           
function folderHandler(handlerPath, fn){                                                         
    for(const file of findFiles(handlerPath)){                                                   
        const { dir, base } = path.parse(file)                                                   
        const props = require(file)                                                              
        fn(props, base, path.parse(dir).name)                                                    
    }                                                                                            
}                                                                                                
folderHandler('./cmds/', (props, file, folder) => {                                              
    bot.commands.set(props.help.name, props)                                                     
    console.log(`[cmds] (${folder}) ${file}`)                                                    
})                                                                                               
                                                                                                 
                 

bot.on('message', async message => {
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
    if(!message.content.startsWith(prefix)) return;
    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot,message,args);
    bot.rUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    bot.uId = message.author.id;
    });

// Оналайн дс сервера
bot.on('ready', () => {
    async function test1() {
        let all = bot.guilds.cache.get(cfg.guildid).memberCount
        let offline = bot.guilds.cache.get(cfg.guildid).members.cache.filter((member) => !member.user.bot && member.user.presence.status !== 'offline').size
        let online = all-offline
        bot.channels.cache.find(c => c.id === cfg.memberallcounter).setName(`⭐╎Участников: ${bot.guilds.cache.get(cfg.guildid).memberCount}`);
        bot.channels.cache.find(c => c.id === cfg.memberonlinecounter).setName(`В сети: ${online}`);
    };
    setInterval(test1, 5000);
});
// Онлайн серверов
const Gamedig = require('gamedig');
bot.on('ready', () => {
     setInterval(() => {
        Gamedig.query({
            type: 'garrysmod',
            host: cfg.ipcounter ,
            port: cfg.portcounter
        }).then(state => {
        
            
            let Guild = bot.guilds.cache.get(cfg.guildid);
            let CountChannel = Guild.channels.cache.get(cfg.servercounter);
            CountChannel.setName("⭐╎Онлайн: "+ state.players.length)
           
        }).catch((e)=>{})
         }, 5000);})  




    // LOGS

    bot.on('messageDelete', message =>{
        let embed = new Discord.MessageEmbed()
        .setTitle('Было удалено сообщение!')
        .setColor('RANDOM')
        .addField(`Удалённое сообщение:`, message.content, true)
        .addField("Автор:",`${message.author.tag} (${message.author})`,true)
        .addField("Канал:", `${message.channel}`, false)
        .setFooter(' - ',`${message.author.avatarURL()}`)
        .setTimestamp(message.createdAt);
      bot.channels.cache.get(cfg.logid).send(embed);
    })
    
    bot.on('guildMemberAdd', member =>{
        let embed = new Discord.MessageEmbed()
        .setThumbnail(member.user.avatarURL())
        .setTitle(`Привет, ${member.user.username}!`)
        .setDescription(`**Ты попал на сервер ${bot.guilds.get(cfg.guildid).name}!
        Ты наш \`${bot.guilds.get(cfg.guildid).memberCount}\` участник! **`)
        .setFooter('Будь всегда на позитиве :3', 'https://cdn.discordapp.com/emojis/590614597610766336.gif?v=1')
        .setColor('RANDOM')
        member.send(embed);
    
        let embed2 = new Discord.MessageEmbed()
        .setThumbnail(member.user.avatarURL())
        .setTitle(`Пользователь вошел на сервер`)
        .addField('Пользователь:', member.user)
        .setColor('RANDOM')
        member.send(embed);
        bot.channels.cache.get(cfg.logid).send(embed2)
    })
    
    bot.on('guildMemberRemove', member => {
        let embed = new Discord.MessageEmbed()
        .setThumbnail(member.user.avatarURL())
        .setTitle(`Пользователь покинул сервер`)
        .addField('Пользователь:', member.user)
        .setColor('RANDOM')
        member.send(embed);
        bot.channels.cache.get(cfg.logid).send(embed)
      })
    











bot.login(cfg.token);