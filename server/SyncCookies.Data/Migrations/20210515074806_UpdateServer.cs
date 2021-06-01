using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace SyncCookies.Data.Migrations
{
    public partial class UpdateServer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActualCookies_ResourceInfoes_ResourceCookieId",
                table: "ActualCookies");

            migrationBuilder.DropTable(
                name: "ResourceInfoes");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Domain",
                table: "ActualCookies");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ActualCookies");

            migrationBuilder.RenameColumn(
                name: "ResourceCookieId",
                table: "ActualCookies",
                newName: "CookieTemplateId");

            migrationBuilder.RenameIndex(
                name: "IX_ActualCookies_ResourceCookieId",
                table: "ActualCookies",
                newName: "IX_ActualCookies_CookieTemplateId");

            migrationBuilder.AddColumn<Guid>(
                name: "ResourceId",
                table: "Clients",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ClientId",
                table: "ActualCookies",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Channels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Channels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Channels_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Channels_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: true),
                    CreateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CookieTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Domain = table.Column<string>(type: "text", nullable: true),
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CookieTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CookieTemplates_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_ResourceId",
                table: "Clients",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ActualCookies_ClientId",
                table: "ActualCookies",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Channels_ClientId",
                table: "Channels",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Channels_UserId",
                table: "Channels",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CookieTemplates_ResourceId",
                table: "CookieTemplates",
                column: "ResourceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActualCookies_Clients_ClientId",
                table: "ActualCookies",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ActualCookies_CookieTemplates_CookieTemplateId",
                table: "ActualCookies",
                column: "CookieTemplateId",
                principalTable: "CookieTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Resources_ResourceId",
                table: "Clients",
                column: "ResourceId",
                principalTable: "Resources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActualCookies_Clients_ClientId",
                table: "ActualCookies");

            migrationBuilder.DropForeignKey(
                name: "FK_ActualCookies_CookieTemplates_CookieTemplateId",
                table: "ActualCookies");

            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Resources_ResourceId",
                table: "Clients");

            migrationBuilder.DropTable(
                name: "Channels");

            migrationBuilder.DropTable(
                name: "CookieTemplates");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropIndex(
                name: "IX_Clients_ResourceId",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_ActualCookies_ClientId",
                table: "ActualCookies");

            migrationBuilder.DropColumn(
                name: "ResourceId",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "ActualCookies");

            migrationBuilder.RenameColumn(
                name: "CookieTemplateId",
                table: "ActualCookies",
                newName: "ResourceCookieId");

            migrationBuilder.RenameIndex(
                name: "IX_ActualCookies_CookieTemplateId",
                table: "ActualCookies",
                newName: "IX_ActualCookies_ResourceCookieId");

            migrationBuilder.AddColumn<Guid>(
                name: "ClientId",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Domain",
                table: "ActualCookies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ActualCookies",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ResourceInfoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceInfoes", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ActualCookies_ResourceInfoes_ResourceCookieId",
                table: "ActualCookies",
                column: "ResourceCookieId",
                principalTable: "ResourceInfoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
