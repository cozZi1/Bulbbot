const Moderation = require("../../utils/moderation/moderation");
const Emotes = require("../../emotes.json");
const Log = require("../../utils/moderation/log");
const Role = require("../../models/role");

module.exports = {
	name: "ban",
	aliases: ["terminate"],
	category: "moderation",
	description: "Bans a user from the guild",
	usage: "ban <user> [reason]",
	clientPermissions: [
		"SEND_MESSAGES",
		"VIEW_CHANNEL",
		"BAN_MEMBERS",
		"USE_EXTERNAL_EMOJIS",
	],
	run: async (client, message, args) => {
		Role.findOne(
			{
				guildID: message.guild.id,
			},
			async (err, roles) => {
				if (
					message.member.roles.cache.has(roles.admin) ||
					message.member.roles.cache.has(roles.moderator) ||
					message.member.hasPermission("BAN_MEMBERS")
				) {
					if (args[0] === undefined || args[0] === null)
						return message.channel.send(
							`${Emotes.actions.warn} Missing required argument \`\`user\`\`\n${Emotes.other.tools} Correct usage of command: \`\`ban|terminate <user> [reason]\`\``
						);
					let target = args[0].replace(/\D/g, ""); // Remove everything except numbers
					let user = message.guild.member(target);
					let reason = args.slice(1).join(" ");
					if (reason === "") reason = "No reason given";
					if (user === null) {
						try {
							user = await client.users.fetch(target);
						} catch (error) {
							user = null;
						}

						if (user === null)
							return await message.channel.send(
								"Unable to find the user, please try again with the correct **user id**"
							);
						if (
							!(await Moderation.ForceBan(
								client,
								message.guild.id,
								target,
								message.author,
								reason
							))
						)
							return message.channel.send(
								`Unable to ban <@${target}> \`\`(${target})\`\`.`
							);
					} else {
						if (
							!(await Moderation.Ban(
								client,
								message.guild.id,
								target,
								message.author,
								reason
							))
						)
							return message.channel.send(
								`Unable to ban <@${target}> \`\`(${target})\`\`.`
							);
						user = user.user;
					}

					await Log.Mod_action(
						client,
						message.guild.id,
						`${Emotes.actions.ban} Banned **${user.username}**#${user.discriminator} \`\`(${user.id})\`\` by **${message.author.username}**#${message.author.discriminator} \`\`(${message.author.id})\`\` \n**Reason:** ${reason} `,
						""
					);

					message.channel.send(
						`${Emotes.actions.ban} Banning <@${target}> \`\`(${target})\`\` for \`\`${reason}\`\``
					);
				} else return message.channel.send(":lock: Missing permission");
			}
		);
	},
};
