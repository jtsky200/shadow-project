/* poppler-link-private.h: qt interface to poppler
 * Copyright (C) 2016, 2018, 2020, 2021 Albert Astals Cid <aacid@kde.org>
 * Copyright (C) 2018 Intevation GmbH <intevation@intevation.de>
 * Copyright (C) 2020 Oliver Sander <oliver.sander@tu-dresden.de>
 * Copyright (C) 2024 Pratham Gandhi <ppg.1382@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street - Fifth Floor, Boston, MA 02110-1301, USA.
 */

#ifndef _POPPLER_LINK_PRIVATE_H_
#define _POPPLER_LINK_PRIVATE_H_

#include <vector>

#include "poppler-link.h"
#include "Link.h"

class LinkOCGState;

namespace Poppler {

class Link;

class LinkPrivate
{
public:
    explicit LinkPrivate(const QRectF &area) : linkArea(area) { }

    virtual ~LinkPrivate();

    static LinkPrivate *get(Link *link) { return link->d_ptr; }

    LinkPrivate(const LinkPrivate &) = delete;
    LinkPrivate &operator=(const LinkPrivate &) = delete;

    QRectF linkArea;
    QVector<Link *> nextLinks;
};

class LinkOCGStatePrivate : public LinkPrivate
{
public:
    LinkOCGStatePrivate(const QRectF &area, const std::vector<::LinkOCGState::StateList> &sList, bool pRB) : LinkPrivate(area), stateList(sList), preserveRB(pRB) { }
    ~LinkOCGStatePrivate() override;

    std::vector<::LinkOCGState::StateList> stateList;
    bool preserveRB;
};

class LinkHidePrivate : public LinkPrivate
{
public:
    LinkHidePrivate(const QRectF &area, const QString &tName, bool show) : LinkPrivate(area), targetName(tName), isShow(show) { }
    ~LinkHidePrivate() override;

    QString targetName;
    bool isShow;
};

class LinkResetFormPrivate : public LinkPrivate
{
public:
    LinkResetFormPrivate(const QRectF &area, const QStringList &fields, const bool exclude) : LinkPrivate(area), m_fields(fields), m_exclude(exclude) { }
    ~LinkResetFormPrivate() override;

    QStringList m_fields;
    bool m_exclude;
};

class LinkSubmitFormPrivate : public LinkPrivate
{
public:
    LinkSubmitFormPrivate(const QRectF &area, const QVector<int> &fieldIds, const QString &url, LinkSubmitForm::SubmitFormFlags flags) : LinkPrivate(area), m_fieldIds(fieldIds), m_url(url), m_flags(flags) { }
    ~LinkSubmitFormPrivate() override;

    QVector<int> m_fieldIds;
    QString m_url;
    LinkSubmitForm::SubmitFormFlags m_flags;
};

}

#endif
